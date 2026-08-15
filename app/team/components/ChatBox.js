"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";

export default function ChatBox({ team, user, savedScripts = [] }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Poll state
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  // Task state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");

  // Code sharing state
  const [showCodeShare, setShowCodeShare] = useState(false);
  const [selectedScript, setSelectedScript] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "team_messages"),
      where("teamId", "==", team.id),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, [team.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, "team_messages"), {
        teamId: team.id,
        senderId: user.uid,
        senderName: user.displayName || "User",
        text: newMessage.trim(),
        createdAt: new Date().toISOString()
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress to JPEG to save space
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

        try {
          await addDoc(collection(db, "team_messages"), {
            teamId: team.id,
            senderId: user.uid,
            senderName: user.displayName || "User",
            image: compressedBase64,
            createdAt: new Date().toISOString()
          });
        } catch (err) {
          console.error("Error sending image:", err);
          alert("Image is too large or an error occurred.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const validOptions = pollOptions.filter(o => o.trim());
    if (!pollQuestion.trim() || validOptions.length < 2) return;

    try {
      await addDoc(collection(db, "team_messages"), {
        teamId: team.id,
        senderId: user.uid,
        senderName: user.displayName || "User",
        poll: {
          question: pollQuestion.trim(),
          options: validOptions,
          votes: {},
          isMultiSelect: isMultiSelect
        },
        createdAt: new Date().toISOString()
      });
      setShowPollForm(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setIsMultiSelect(false);
    } catch (err) {
      console.error("Error creating poll:", err);
    }
  };

  const handleVote = async (msgId, poll, optionIndex) => {
    const currentVotes = poll.votes[user.uid] || [];
    let newVotes;
    
    if (poll.isMultiSelect) {
      if (currentVotes.includes(optionIndex)) {
        newVotes = currentVotes.filter(idx => idx !== optionIndex);
      } else {
        newVotes = [...currentVotes, optionIndex];
      }
    } else {
      newVotes = [optionIndex];
    }

    try {
      await updateDoc(doc(db, "team_messages", msgId), {
        [`poll.votes.${user.uid}`]: newVotes
      });
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      await addDoc(collection(db, "team_messages"), {
        teamId: team.id,
        senderId: user.uid,
        senderName: user.displayName || "User",
        task: {
          title: taskTitle.trim(),
          completed: false,
          completedBy: null,
          completedAt: null
        },
        createdAt: new Date().toISOString()
      });
      setShowTaskForm(false);
      setTaskTitle("");
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleToggleTask = async (msgId, task) => {
    try {
      await updateDoc(doc(db, "team_messages", msgId), {
        "task.completed": !task.completed,
        "task.completedBy": !task.completed ? (user.displayName || "User") : null,
        "task.completedAt": !task.completed ? new Date().toISOString() : null
      });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleShareCode = async () => {
    if (!selectedScript) return;
    try {
      await addDoc(collection(db, "team_messages"), {
        teamId: team.id,
        senderId: user.uid,
        senderName: user.displayName || "User",
        codeShare: {
          scriptName: selectedScript.name,
          code: selectedScript.code,
          alliance: selectedScript.alliance || "red",
          gameMode: selectedScript.gameMode || "push_back"
        },
        createdAt: new Date().toISOString()
      });

      setShowCodeShare(false);
      setSelectedScript(null);
    } catch (err) {
      console.error("Error sharing code:", err);
      alert("Failed to share code: " + (err.message || err));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 flex-1">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === user.uid;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <span className="text-xs font-mono text-slate-500 mb-1 px-1">
                {isMe ? "You" : msg.senderName}
              </span>
              <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl ${isMe ? "bg-emerald-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none"}`}>
                
                {/* Text Message */}
                {msg.text && <p className="whitespace-pre-wrap font-sans text-sm">{msg.text}</p>}
                
                {/* Link Message */}
                {msg.link && (
                  <a href={msg.link} className="mt-2 inline-block bg-white/20 hover:bg-white/30 text-white font-mono text-xs px-3 py-1.5 rounded-lg transition-colors">
                    🔗 View Link
                  </a>
                )}
                
                {/* Image Message */}
                {msg.image && (
                  <img src={msg.image} alt="Upload" className="rounded-xl max-h-64 object-contain mt-1" />
                )}

                {/* Poll Message */}
                {msg.poll && (
                  <div className="mt-2 w-full min-w-[200px] md:min-w-[300px]">
                    <div className="font-bold mb-3 flex justify-between items-start">
                      <span>📊 {msg.poll.question}</span>
                      <span className="text-[10px] font-mono opacity-70 ml-2 bg-black/20 px-2 py-0.5 rounded">
                        {msg.poll.isMultiSelect ? "Multiple Choice" : "Single Choice"}
                      </span>
                    </div>
                    <div className="space-y-2 w-full">
                      {msg.poll.options.map((opt, idx) => {
                        let count = 0;
                        const hasVoted = (msg.poll.votes[user.uid] || []).includes(idx);
                        Object.values(msg.poll.votes).forEach(userVotes => {
                          if (userVotes.includes(idx)) count++;
                        });
                        const totalVotes = Object.values(msg.poll.votes).length;
                        const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);

                        return (
                          <button
                            key={idx}
                            onClick={() => handleVote(msg.id, msg.poll, idx)}
                            className={`relative w-full text-left overflow-hidden rounded-lg border transition-all ${hasVoted ? 'border-emerald-300 bg-emerald-900/50' : 'border-black/20 bg-black/10 hover:bg-black/20'}`}
                          >
                            <div 
                              className={`absolute inset-0 opacity-20 ${isMe ? 'bg-black' : 'bg-emerald-500'}`} 
                              style={{ width: `${percent}%` }}
                            />
                            
                            <div className="relative p-2 text-sm flex justify-between z-10">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded ${msg.poll.isMultiSelect ? 'rounded-sm' : 'rounded-full'} border flex items-center justify-center ${hasVoted ? 'border-emerald-400 bg-emerald-400' : 'border-slate-400'}`}>
                                  {hasVoted && <div className="w-1.5 h-1.5 bg-slate-900 rounded-sm" />}
                                </div>
                                <span>{opt}</span>
                              </div>
                              <span className="font-mono text-xs opacity-70">{count} ({percent}%)</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[10px] opacity-60 mt-2 font-mono">
                      {Object.keys(msg.poll.votes).length} total voters
                    </div>
                  </div>
                )}

                {/* Task Message */}
                {msg.task && (
                  <div className="mt-2 w-full min-w-[250px] md:min-w-[350px] bg-slate-900/50 rounded-xl p-3 border border-slate-700">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleTask(msg.id, msg.task)}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all ${
                          msg.task.completed
                            ? "bg-emerald-500 border-emerald-500 text-slate-950 font-bold"
                            : "border-slate-500 hover:border-emerald-400"
                        }`}
                      >
                        {msg.task.completed && <span className="text-xs">✓</span>}
                      </button>
                      <div className="flex-1">
                        <p className={`font-mono text-sm font-bold ${msg.task.completed ? "line-through text-slate-500" : ""}`}>
                          {msg.task.title}
                        </p>
                        {msg.task.completed && msg.task.completedBy && (
                          <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                            ✓ Completed by {msg.task.completedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Code Share Message */}
                {msg.codeShare && (
                  <div className="mt-2 w-full min-w-[280px] md:min-w-[380px] bg-slate-950/80 rounded-xl p-3 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💾</span>
                      <span className="font-mono text-xs font-bold text-emerald-400">{msg.codeShare.scriptName}</span>
                      <span className="text-[9px] bg-slate-800/80 px-2 py-0.5 rounded text-slate-400">
                        {msg.codeShare.gameMode === "override" ? "Override" : "Push Back"}
                      </span>
                    </div>
                    <pre className="bg-slate-950 border border-slate-700/50 rounded p-2 text-[11px] text-emerald-400 overflow-x-auto max-h-[200px]">
                      <code>{msg.codeShare.code}</code>
                    </pre>
                    <p className="text-[10px] text-slate-400 mt-2">Alliance: {msg.codeShare.alliance?.toUpperCase()}</p>
                  </div>
                )}
                
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Poll Creation Form */}
      {showPollForm && (
        <div className="bg-slate-900 border-t border-slate-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold font-mono text-emerald-400">Create Poll</h3>
            <button onClick={() => setShowPollForm(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <form onSubmit={handleCreatePoll} className="space-y-3">
            <input
              type="text"
              placeholder="Poll Question"
              required
              value={pollQuestion}
              onChange={e => setPollQuestion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
            {pollOptions.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={e => {
                    const newOpts = [...pollOptions];
                    newOpts[i] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
                {pollOptions.length > 2 && (
                  <button 
                    type="button" 
                    onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                    className="px-3 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50"
                  >
                    🗑
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => setPollOptions([...pollOptions, ""])}
              className="text-emerald-500 text-xs font-mono font-bold hover:underline"
            >
              + Add Option
            </button>
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 font-mono">
                <input 
                  type="checkbox" 
                  checked={isMultiSelect} 
                  onChange={e => setIsMultiSelect(e.target.checked)} 
                  className="w-4 h-4 accent-emerald-500"
                />
                Allow Multiple Choices
              </label>
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-sm transition-colors">
                Send Poll
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task Creation Form */}
      {showTaskForm && (
        <div className="bg-slate-900 border-t border-slate-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold font-mono text-emerald-400">✓ Create Task</h3>
            <button onClick={() => setShowTaskForm(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <form onSubmit={handleCreateTask} className="space-y-3">
            <input
              type="text"
              placeholder="Task title (e.g., 'Build intake', 'Fix motor 3')"
              required
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-sm transition-colors"
            >
              Create Task
            </button>
          </form>
        </div>
      )}

      {/* Code Share Form */}
      {showCodeShare && (
        <div className="bg-slate-900 border-t border-slate-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold font-mono text-emerald-400">💾 Share Auton Code</h3>
            <button onClick={() => setShowCodeShare(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <form onSubmit={handleShareCode} className="space-y-3">
            <select
              value={selectedScript?.id || ""}
              onChange={e => {
                const script = savedScripts.find(s => s.id === e.target.value);
                setSelectedScript(script);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
            >
              <option value="">Select a saved script...</option>
              {savedScripts.map(script => (
                <option key={script.id} value={script.id}>
                  {script.name} ({script.gameMode === "override" ? "Override" : "Push Back"})
                </option>
              ))}
            </select>
            {selectedScript && (
              <div className="bg-slate-950 border border-slate-700 rounded p-2 max-h-[150px] overflow-auto">
                <pre className="text-[10px] text-emerald-400">
                  <code>{selectedScript.code}</code>
                </pre>
              </div>
            )}
            <button 
              type="submit" 
              disabled={!selectedScript}
              className="w-full px-4 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 text-white rounded font-bold text-sm transition-colors"
            >
              Share Code
            </button>
          </form>
        </div>
      )}

      {/* Message Input Area (Compact Option Buttons & Longer Typing Box) */}
      <div className="p-3 md:p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 w-full">
          
          {/* Tightly Spaced Option Buttons (No Text Labels) */}
          <div className="flex items-center gap-1 shrink-0">
            <button 
              type="button"
              onClick={() => setShowPollForm(!showPollForm)}
              className="p-2 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 rounded-lg transition-colors border border-slate-800 hover:border-slate-700"
              title="Poll"
            >
              📊
            </button>

            <button 
              type="button"
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="p-2 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 rounded-lg transition-colors border border-slate-800 hover:border-slate-700"
              title="Share Task"
            >
              ✓
            </button>

            <button 
              type="button"
              onClick={() => setShowCodeShare(!showCodeShare)}
              disabled={savedScripts.length === 0}
              className="p-2 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-slate-800 hover:border-slate-700"
              title="Upload Code"
            >
              💾
            </button>

            <label 
              className="p-2 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer border border-slate-800 hover:border-slate-700" 
              title="Upload Image"
            >
              🖼️
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          {/* Expanded Input Box & Send Button */}
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message to the team..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="px-5 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors text-sm shrink-0"
            >
              Send
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
