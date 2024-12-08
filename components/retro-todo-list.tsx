  'use client'

  import React, { useState, useEffect, useCallback } from 'react'
  import { v4 as uuidv4 } from 'uuid'
  import { retroSounds } from '../utils/sounds'
  import { gameSounds } from '../utils/gameSounds'
  import { Music, ChevronRight, ChevronDown, Search, ArrowUp, ArrowDown, Menu, X } from 'lucide-react'
  import StreakTracker from './StreakTracker'
  import { missions, achievements, difficultyLevels, Mission } from '../utils/missionsAndAchievements'

  interface Subtask {
    id: string
    text: string
    completed: boolean
  }

  interface Todo {
    id: string
    text: string
    completed: boolean
    subtasks: Subtask[]
    expanded: boolean
    createdAt: string;
    deleting?: boolean; 
  }

  interface StreakData {
    [date: string]: number;
  }

  interface GameState {
    activeMission: Mission | null;
    completedMissions: string[];
    unlockedAchievements: string[];
    difficultyLevel: number;
    streak: number;
  }

  const SOCIAL_LINKS = [
    { name: 'GitHub', url: 'https://github.com/lcscostadev' },
    { name: 'Twitter', url: 'https://twitter.com/lcscostadev' },
    { name: 'YouTube', url: 'https://www.youtube.com/@lcscostadev' },
  ]

  const saveTodosToLocalStorage = (todos: Todo[]) => {
    localStorage.setItem('retroTasks', JSON.stringify(todos));
  };

  const saveStreakDataToLocalStorage = (streakData: StreakData) => {
    localStorage.setItem('streakData', JSON.stringify(streakData));
  };

  const saveGameStateToLocalStorage = (gameState: GameState) => {
    localStorage.setItem('gameState', JSON.stringify(gameState));
  };

  export default function RetroTodoList() {
    const [todos, setTodos] = useState<Todo[]>(() => {
      const savedTodos = localStorage.getItem('retroTasks');
      return savedTodos ? JSON.parse(savedTodos) : [];
    });
    const [streakData, setStreakData] = useState<StreakData>(() => {
      const savedStreakData = localStorage.getItem('streakData');
      return savedStreakData ? JSON.parse(savedStreakData) : {};
    });
    const [inputValue, setInputValue] = useState('')
    const [subtaskInput, setSubtaskInput] = useState('')
    const [cursorVisible, setCursorVisible] = useState(true)
    const [congratsMessage, setCongratsMessage] = useState('')
    const [typingIndex, setTypingIndex] = useState(0)
    const [fakeCommand, setFakeCommand] = useState('')
    const [volume, setVolume] = useState(50)
    const [isMusicPlaying, setIsMusicPlaying] = useState(false)
    const [socialTyping, setSocialTyping] = useState('')
    const [isSocialTyping, setIsSocialTyping] = useState(false)
    const [isAppDisabled, setIsAppDisabled] = useState(false)
    const [showClearMessage, setShowClearMessage] = useState(false)
    const [filter, setFilter] = useState<'all' | 'completed' | 'uncompleted'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [completionPercentage, setCompletionPercentage] = useState(0)
    const [gameState, setGameState] = useState<GameState>(() => {
      const savedGameState = localStorage.getItem('gameState');
      return savedGameState ? JSON.parse(savedGameState) : {
        activeMission: null,
        completedMissions: [],
        unlockedAchievements: [],
        difficultyLevel: 0,
        streak: 0,
      };
    });
    const [showAchievements, setShowAchievements] = useState(false);
    const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);

    useEffect(() => {
      retroSounds.init();
      gameSounds.init();
      const interval = setInterval(() => {
        setCursorVisible((prev) => !prev)
      }, 530)
      return () => clearInterval(interval)
    }, [])

    useEffect(() => {
      if (congratsMessage && typingIndex < congratsMessage.length) {
        const timer = setTimeout(() => {
          setTypingIndex(typingIndex + 1)
        }, 100)
        return () => clearTimeout(timer)
      } else if (typingIndex === congratsMessage.length) {
        const timer = setTimeout(() => {
          setCongratsMessage('')
          setTypingIndex(0)
        }, 2000)
        return () => clearTimeout(timer)
      }
    }, [congratsMessage, typingIndex])

    useEffect(() => {
      if (fakeCommand) {
        const timer = setTimeout(() => {
          setFakeCommand('')
        }, 2000)
        return () => clearTimeout(timer)
      }
    }, [fakeCommand])

    useEffect(() => {
      retroSounds.setVolume(volume / 100)
    }, [volume])

    const updateStreakData = useCallback(() => {
      const today = new Date().toISOString().split('T')[0];
      const completedTasks = todos.filter(todo => todo.completed).length;
      setStreakData(prevData => {
        const newData = { ...prevData, [today]: completedTasks };
        saveStreakDataToLocalStorage(newData);
        return newData;
      });

      // Update streak
      if (completedTasks >= gameState.difficultyLevel + 1) {
        setGameState(prev => ({ ...prev, streak: prev.streak + 1 }));
      } else {
        setGameState(prev => ({ ...prev, streak: 0 }));
      }
    }, [todos, gameState.difficultyLevel]);

    useEffect(() => {
      updateStreakData();
    }, [todos, updateStreakData]);

    useEffect(() => {
      const completedTasks = todos.filter(todo => todo.completed).length;
      const totalTasks = todos.length;
      const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
      setCompletionPercentage(percentage);
    }, [todos]);

    const addTodo = (e: React.FormEvent) => {
      e.preventDefault()
      if (inputValue.trim() && !isAppDisabled) {
        setTodos(prevTodos => {
          const newTodos = [...prevTodos, {
            id: uuidv4(),
            text: inputValue,
            completed: false,
            subtasks: [],
            expanded: false,
            createdAt: new Date().toISOString()
          }]
          saveTodosToLocalStorage(newTodos);
          return newTodos;
        })
        setInputValue('')
        retroSounds.add()
        clearSocialTyping()

        // Add interaction prompt
        if (Math.random() < 0.3) {
          setInteractionPrompt("What will you do next? [A] Add another task, [B] Check achievements");
        }
      }
    }

    const addSubtask = (todoId: string) => {
      if (subtaskInput.trim() && !isAppDisabled) {
        setTodos(prevTodos => {
          const newTodos = prevTodos.map(todo =>
            todo.id === todoId
              ? { ...todo, subtasks: [...todo.subtasks, { id: uuidv4(), text: subtaskInput, completed: false }] }
              : todo
          )
          saveTodosToLocalStorage(newTodos);
          return newTodos;
        })
        setSubtaskInput('')
        retroSounds.add()
        clearSocialTyping()
      }
    }

    const toggleTodo = (id: string) => {
      if (!isAppDisabled) {
        setTodos(prevTodos => {
          const newTodos = prevTodos.map(todo => {
            if (todo.id === id) {
              const allSubtasksCompleted = todo.subtasks.every(subtask => subtask.completed)
              const newCompleted = todo.subtasks.length === 0 ? !todo.completed : allSubtasksCompleted
              if (newCompleted) {
                gameSounds.completeTask()
              } else {
                retroSounds.uncheck()
              }
              return { ...todo, completed: newCompleted }
            }
            return todo
          })
          saveTodosToLocalStorage(newTodos);
          return newTodos;
        })
        checkForCompletedTasks()
        clearSocialTyping()
        updateStreakData()
      }
    }

    const toggleSubtask = (todoId: string, subtaskId: string) => {
      if (!isAppDisabled) {
        setTodos(prevTodos => {
          const newTodos = prevTodos.map(todo => {
            if (todo.id === todoId) {
              const updatedSubtasks = todo.subtasks.map(subtask =>
                subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
              )
              const allSubtasksCompleted = updatedSubtasks.every(subtask => subtask.completed)
              if (allSubtasksCompleted) {
                retroSounds.check()
              } else {
                retroSounds.uncheck()
              }
              return { ...todo, subtasks: updatedSubtasks, completed: allSubtasksCompleted }
            }
            return todo
          })
          saveTodosToLocalStorage(newTodos);
          return newTodos;
        })
        checkForCompletedTasks()
        clearSocialTyping()
      }
    }

    const checkForCompletedTasks = () => {
      const completedTodo = todos.find(todo => todo.completed && !todo.subtasks.some(subtask => !subtask.completed))
      if (completedTodo) {
        setCongratsMessage('Nice work :)')
        setTypingIndex(0)
      }
    }

    const deleteTodo = (id: string) => {
      if (!isAppDisabled) {
        setTodos(prevTodos => {
          const newTodos = prevTodos.filter(todo => todo.id !== id)
          saveTodosToLocalStorage(newTodos);
          return newTodos;
        })
        retroSounds.delete()
        clearSocialTyping()
      }
    }

    const deleteSubtask = (todoId: string, subtaskId: string) => {
      if (!isAppDisabled) {
        setTodos(prevTodos => {
          const newTodos = prevTodos.map(todo =>
            todo.id === todoId
              ? { ...todo, subtasks: todo.subtasks.filter(subtask => subtask.id !== subtaskId) }
              : todo
          )
          saveTodosToLocalStorage(newTodos);
          return newTodos;
        })
        retroSounds.delete()
        clearSocialTyping()
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)
      if (!isAppDisabled) {
        retroSounds.typing()
      } else if (value.toLowerCase() === 'clear') {
        clearSocialTyping()
        setInputValue('')
      }
    }

    const handleSubtaskInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSubtaskInput(e.target.value)
      retroSounds.typing()
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(Number(e.target.value))
    }

    const toggleMusic = () => {
      retroSounds.toggleMusic();
      const isPlaying = retroSounds.isMusicPlaying();
      setIsMusicPlaying(isPlaying ?? false); 
    };
    

    const toggleExpanded = (id: string) => {
      setTodos(prevTodos => prevTodos.map(todo =>
        todo.id === id ? { ...todo, expanded: !todo.expanded } : todo
      ))
    }

    const typeSocials = useCallback(() => {
      setIsAppDisabled(true)
      setIsSocialTyping(true)
      let fullText = '> Accessing social links...\n\n'
      SOCIAL_LINKS.forEach(link => {
        fullText += `${link.name}: ${link.url}\n`
      })
      fullText += '\n> Social links retrieved.\n\n> Type "clear" to dismiss.'

      let i = 0
      const intervalId = setInterval(() => {
        if (i < fullText.length) {
          setSocialTyping(prev => prev + fullText[i])
          retroSounds.socialTyping()
          i++
        } else {
          clearInterval(intervalId)
          setIsSocialTyping(false)
          setShowClearMessage(true)
        }
      }, 50)

      return () => clearInterval(intervalId)
    }, [])

    const clearSocialTyping = useCallback(() => {
      setSocialTyping('')
      setIsAppDisabled(false)
      setShowClearMessage(false)
    }, [])

    const deleteAllChecked = () => {
      if (!isAppDisabled) {
        setTodos(prevTodos => {
          const newTodos = prevTodos.filter(todo => !todo.completed)
          saveTodosToLocalStorage(newTodos);
          return newTodos;
        })
        retroSounds.delete()
        clearSocialTyping()
      }
    }

    const deleteAll = () => {
      if (!isAppDisabled) {
        setTodos(() => []); 
        saveTodosToLocalStorage([]);
        retroSounds.delete();
        clearSocialTyping();
      }
    };
    
    const moveTask = (id: string, direction: 'up' | 'down') => {
      if (!isAppDisabled) {
        const index = todos.findIndex(todo => todo.id === id)
        if (index === -1) return

        setTodos(prevTodos => {
          const newTodos = [...prevTodos]
          const [removed] = newTodos.splice(index, 1)

          if (direction === 'up' && index > 0) {
            newTodos.splice(index - 1, 0, removed)
          } else if (direction === 'down' && index < prevTodos.length - 1) {
            newTodos.splice(index + 1, 0, removed)
          } else {
            newTodos.splice(index, 0, removed)
          }

          saveTodosToLocalStorage(newTodos);
          return newTodos;
        })
        retroSounds.moveTask()
      }
    }

    const checkMissionCompletion = useCallback(() => {
      if (gameState.activeMission) {
        const completedTasks = todos.filter(todo => todo.completed).length;
        if (completedTasks >= gameState.activeMission.requirement) {
          setGameState(prev => ({
            ...prev,
            completedMissions: [...prev.completedMissions, prev.activeMission!.id],
            activeMission: null,
          }));
          gameSounds.unlockAchievement();
          setCongratsMessage(gameState.activeMission.reward);
        }
      }
    }, [todos, gameState.activeMission]);

    const checkAchievements = useCallback(() => {
      // const completedTasks = todos.filter(todo => todo.completed).length;
      const todayTasks = todos.filter(todo => {
        const createdToday = new Date(todo.createdAt).toDateString() === new Date().toDateString();
        return createdToday && todo.completed;
      }).length;

      if (todayTasks >= 10 && !gameState.unlockedAchievements.includes('taskConqueror')) {
        setGameState(prev => ({
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, 'taskConqueror'],
        }));
        gameSounds.unlockAchievement();
        setCongratsMessage('Achievement unlocked: Task Conqueror!');
      }

      if (gameState.streak >= 30 && !gameState.unlockedAchievements.includes('streakHero')) {
        setGameState(prev => ({
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, 'streakHero'],
        }));
        gameSounds.unlockAchievement();
        setCongratsMessage('Achievement unlocked: Streak Hero!');
      }
    }, [todos, gameState.streak, gameState.unlockedAchievements]);

    useEffect(() => {
      saveGameStateToLocalStorage(gameState);
    }, [gameState]);

    useEffect(() => {
      checkMissionCompletion();
      checkAchievements();
    }, [todos, checkMissionCompletion, checkAchievements]);

    const startNewMission = useCallback(() => {
      const availableMissions = missions.filter(mission => !gameState.completedMissions.includes(mission.id));
      if (availableMissions.length > 0) {
        const randomMission = availableMissions[Math.floor(Math.random() * availableMissions.length)];
        setGameState(prev => ({ ...prev, activeMission: randomMission }));
      }
    }, [gameState.completedMissions]);

    useEffect(() => {
      if (!gameState.activeMission) {
        startNewMission();
      }
    }, [gameState.activeMission, startNewMission]);

    const handleInteraction = (choice: 'A' | 'B') => {
      if (choice === 'A') {
        setInputValue('');
        setInteractionPrompt(null);
      } else {
        setShowAchievements(true);
        setInteractionPrompt(null);
      }
    };

    const toggleDifficultyMode = () => {
      setGameState(prev => ({
        ...prev,
        difficultyLevel: (prev.difficultyLevel + 1) % difficultyLevels.length,
      }));
      setCongratsMessage(`Difficulty changed to ${difficultyLevels[gameState.difficultyLevel]}!`);
    };

    const filteredTodos = todos.filter(todo => {
      const matchesFilter =
        (filter === 'all') ||
        (filter === 'completed' && todo.completed) ||
        (filter === 'uncompleted' && !todo.completed);

      const matchesSearch =
        todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.subtasks.some(subtask => subtask.text.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesFilter && matchesSearch;
    });

    return (
      <div className="min-h-screen bg-black p-4 font-['VT323',monospace] text-green-500 flex items-center justify-center retro-background">
        <div className="w-full max-w-4xl aspect-video bg-black border-[12px] border-[#e0e0d0] rounded-lg shadow-lg shadow-green-500/20 overflow-hidden relative crt-screen">
          <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.6)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-green-500 opacity-10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,255,0,0.2)_0%,_rgba(0,0,0,0.5)_100%)] pointer-events-none"></div>
          <div className="h-full p-4 overflow-auto scanlines crt">
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-48 bg-gray-700 rounded-full h-2.5 mr-2">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm">{completionPercentage}% completed</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleMusic}
                  className="text-green-500 hover:text-green-400 focus:outline-none glow"
                  aria-label={isMusicPlaying ? "Stop music" : "Play music"}
                >
                  <Music size={24} className={isMusicPlaying ? "animate-pulse" : ""} />
                </button>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-4 appearance-none bg-green-900 rounded-full outline-none opacity-70 transition-opacity duration-200 hover:opacity-100"
                    style={{
                      background: `linear-gradient(to right, #22c55e 0%, #22c55e ${volume}%, #065f46 ${volume}%, #065f46 100%)`
                    }}
                    aria-label="Volume control"
                  />
                  <span className="text-xs">{volume}%</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-green-500 hover:text-green-400 focus:outline-none glow"
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            {isMenuOpen && (
              <div className="mb-4 p-2 bg-black border border-green-500 rounded">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={deleteAllChecked}
                    className="bg-red-500 text-black px-2 py-1 text-xs hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 font-bold uppercase border border-red-500 glow disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete all checked tasks"
                    disabled={isAppDisabled || todos.filter(todo => todo.completed).length === 0}
                  >
                    [DELETE CHECKED]
                  </button>
                  <button
                    onClick={deleteAll}
                    className="bg-red-500 text-black px-2 py-1 text-xs hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 font-bold uppercase border border-red-500 glow disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete all tasks"
                    disabled={isAppDisabled || todos.length === 0}
                  >
                    [DELETE ALL]
                  </button>
                </div>
                <button
                  onClick={typeSocials}
                  className="w-full bg-green-500 text-black px-2 py-2 text-sm hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 font-bold uppercase border border-green-500 glow disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Show social media links"
                  disabled={isSocialTyping || isAppDisabled || showClearMessage}
                >
                  [SHOW SOCIALS]
                </button>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`bg-green-500 text-black px-2 py-1 text-xs hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 font-bold uppercase border border-green-500 glow ${filter === 'all' ? 'bg-green-600' : ''}`}
                    aria-label="Show all tasks"
                    disabled={isAppDisabled}
                  >
                    [ALL]
                  </button>
                  <button
                    onClick={() => setFilter('completed')}
                    className={`bg-green-500 text-black px-2 py-1 text-xs hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 font-bold uppercase border border-green-500 glow ${filter === 'completed' ? 'bg-green-600' : ''}`}
                    aria-label="Show completed tasks"
                    disabled={isAppDisabled}
                  >
                    [COMPLETED]
                  </button>
                  <button
                    onClick={() => setFilter('uncompleted')}
                    className={`bg-green-500 text-black px-2 py-1 text-xs hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 font-bold uppercase border border-green-500 glow ${filter === 'uncompleted' ? 'bg-green-600' : ''}`}
                    aria-label="Show uncompleted tasks"
                    disabled={isAppDisabled}
                  >
                    [UNCOMPLETED]
                  </button>
                </div>
                <button
                  onClick={toggleDifficultyMode}
                  className="w-full mt-2 bg-yellow-500 text-black px-2 py-2 text-sm hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 font-bold uppercase border border-yellow-500 glow disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Change difficulty"
                >
                  [CHANGE DIFFICULTY: {difficultyLevels[gameState.difficultyLevel]}]
                </button>
                <button
                  onClick={() => setShowAchievements(true)}
                  className="w-full mt-2 bg-purple-500 text-black px-2 py-2 text-sm hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 font-bold uppercase border border-purple-500 glow disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Show achievements"
                >
                  [SHOW ACHIEVEMENTS]
                </button>
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-b border-green-500 p-1 pr-8 text-green-500 focus:outline-none focus:border-green-300 font-bold uppercase text-xs glow"
                    placeholder="SEARCH TASKS..."
                    aria-label="Search tasks"
                    style={{ caretColor: 'transparent' }}
                    disabled={isAppDisabled}
                  />
                  <Search className="absolute right-1 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
                </div>
              </div>
            )}

            <form onSubmit={addTodo} className="mb-4 flex">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className="flex-grow bg-transparent border-b border-green-500 p-2 text-green-500 focus:outline-none focus:border-green-300 font-bold uppercase glow"
                placeholder={isAppDisabled ? "TYPE 'CLEAR' TO DISMISS" : "ENTER A NEW TASK..."}
                aria-label="New task"
                style={{ caretColor: 'transparent' }}
                disabled={isSocialTyping}
              />
              <button
                type="submit"
                className="ml-2 bg-green-500 text-black px-2 py-1 hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 font-bold uppercase border border-green-500 glow disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add task"
                disabled={isAppDisabled}
              >
                [ADD]
              </button>
            </form>
            <ul className="space-y-2">
              {filteredTodos.map((todo, index) => (
                <li
                  key={todo.id}
                  className={`border-b border-green-500 pb-1 group transition-all duration-300 ${todo.deleting ? 'opacity-0 h-0' : 'opacity-100 h-auto'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-grow">
                      <button
                        onClick={() => toggleExpanded(todo.id)}
                        className="mr-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={todo.expanded ? "Collapse subtasks" : "Expand subtasks"}
                        disabled={isAppDisabled}
                      >
                        {todo.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="mr-2 form-checkbox h-4 w-4 text-green-500 border border-green-500 rounded focus:ring-green-500 appearance-none checked:bg-green-500 checked:border-transparent transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Mark ${todo.completed ? 'incomplete' : 'complete'}`}
                        disabled={isAppDisabled}
                      />
                      <span
                        className={`uppercase transition-all duration-300 ease-in-out relative ${todo.completed ? 'pixelated-text' : ''
                          } glow text-sm`}
                        data-text={todo.text}
                      >
                        {todo.text}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => moveTask(todo.id, 'up')}
                        className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-1 focus:ring-green-300 mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Move task up"
                        disabled={isAppDisabled || index === 0}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => moveTask(todo.id, 'down')}
                        className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-1 focus:ring-green-300 mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Move task down"
                        disabled={isAppDisabled || index === filteredTodos.length - 1}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-1 focus:ring-red-300 uppercase font-bold glow disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        aria-label="Delete task"
                        disabled={isAppDisabled}
                      >
                        [X]
                      </button>
                    </div>
                  </div>
                  {todo.expanded && (
                    <div className="ml-6 mt-1">
                      <ul className="space-y-1">
                        {todo.subtasks.map((subtask) => (
                          <li key={subtask.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={() => toggleSubtask(todo.id, subtask.id)}
                                className="mr-2 form-checkbox h-3 w-3 text-green-500 border border-green-500 rounded focus:ring-green-500 appearance-none checked:bg-green-500 checked:border-transparent transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label={`Mark subtask ${subtask.completed ? 'incomplete' : 'complete'}`}
                                disabled={isAppDisabled}
                              />
                              <span className={`uppercase ${subtask.completed ? 'line-through' : ''} glow text-xs`}>
                                {subtask.text}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteSubtask(todo.id, subtask.id)}
                              className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-1 focus:ring-red-300 uppercase font-bold glow disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                              aria-label="Delete subtask"
                              disabled={isAppDisabled}
                            >
                              [X]
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-1 flex">
                        <input
                          type="text"
                          value={subtaskInput}
                          onChange={handleSubtaskInputChange}
                          className="flex-grow bg-transparent border-b border-green-500 p-1 text-green-500 focus:outline-none focus:border-green-300 font-bold uppercase text-xs glow disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="ADD SUBTASK..."
                          aria-label="New subtask"
                          style={{ caretColor: 'transparent' }}
                          disabled={isAppDisabled}
                        />
                        <button
                          onClick={() => addSubtask(todo.id)}
                          className="ml-1 bg-green-500 text-black px-1 py-0.5 text-xs hover:bg-green-400 focus:outline-none focus:ring-1 focus:ring-green-300 font-bold uppercase border border-green-500 glow disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Add subtask"
                          disabled={isAppDisabled}
                        >
                          [ADD]
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {gameState.activeMission && (
              <div className="mt-4 p-2 bg-black border border-yellow-500 rounded">
                <h3 className="text-yellow-500 font-bold">Current Mission:</h3>
                <p>{gameState.activeMission.description}</p>
              </div>
            )}

            {showAchievements && (
              <div className="mt-4 p-2 bg-black border border-purple-500 rounded">
                <h3 className="text-purple-500 font-bold">Achievements:</h3>
                <ul>
                  {achievements.map(achievement => (
                    <li key={achievement.id} className={`flex items-center ${gameState.unlockedAchievements.includes(achievement.id) ? 'text-purple-300' : 'text-gray-500'}`}>
                      <span className="mr-2">{achievement.icon}</span>
                      <span>{achievement.name}: {achievement.description}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowAchievements(false)}
                  className="mt-2 bg-purple-500 text-black px-2 py-1 text-xs hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 font-bold uppercase border border-purple-500 glow"
                >
                  [CLOSE]
                </button>
              </div>
            )}

            {interactionPrompt && (
              <div className="mt-4 p-2 bg-black border border-blue-500 rounded">
                <p>{interactionPrompt}</p>
                <div className="mt-2 flex justify-around">
                  <button
                    onClick={() => handleInteraction('A')}
                    className="bg-blue-500 text-black px-2 py-1 text-xs hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 font-bold uppercase border border-blue-500 glow"
                  >
                    [A]
                  </button>
                  <button
                    onClick={() => handleInteraction('B')}
                    className="bg-blue-500 text-black px-2 py-1 text-xs hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 font-bold uppercase border border-blue-500 glow"
                  >
                    [B]
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 text-xs relative">
              {socialTyping ? (
                <pre className="whitespace-pre-wrap glow">{socialTyping}</pre>
              ) : (
                <>
                  <span className="glow">{`> ${inputValue}`}</span>
                  <span className={`ml-1 ${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 glow`}>
                    █
                  </span>
                </>
              )}
              <span className="absolute left-0 top-6 text-yellow-400 glow">
                {congratsMessage.slice(0, typingIndex)}
              </span>
              {fakeCommand && (
                <span className="absolute left-0 top-12 text-red-500 glow">
                  {fakeCommand}
                </span>
              )}
            </div>
            {showClearMessage && (
              <div className="mt-2 text-yellow-400 glow text-xs">
                &gt; Type &quot;clear&quot; to dismiss social links and continue using the app.
              </div>
            )}
            <div className="mt-8">
              <h2 className="text-2xl mb-2 glow">Streak Tracker</h2>
              <div className="overflow-x-auto pb-4">
                <StreakTracker streakData={streakData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

