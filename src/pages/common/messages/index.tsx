import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const SESSIONS = [
  {
    id: 1,
    name: "Anika Rahman",
    avatar: "AR",
    color: "#c084fc",
    lastMsg: "Send me the files when ready 📎",
    time: "2m ago",
    unread: 3,
    online: true,
  },
  {
    id: 2,
    name: "Design Team",
    avatar: "DT",
    color: "#34d399",
    lastMsg: "Zara: Here's the updated mockup",
    time: "18m ago",
    unread: 0,
    online: true,
    isGroup: true,
  },
  {
    id: 3,
    name: "Tariq Hossain",
    avatar: "TH",
    color: "#f97316",
    lastMsg: "Voice note · 0:42",
    time: "1h ago",
    unread: 1,
    online: false,
  },
  {
    id: 4,
    name: "Nadia Islam",
    avatar: "NI",
    color: "#38bdf8",
    lastMsg: "Got it, thanks!",
    time: "3h ago",
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: "Project Alpha",
    avatar: "PA",
    color: "#fb7185",
    lastMsg: "Meeting notes attached",
    time: "Yesterday",
    unread: 0,
    online: false,
    isGroup: true,
  },
  {
    id: 6,
    name: "Rahim Chowdhury",
    avatar: "RC",
    color: "#a78bfa",
    lastMsg: "Let's catch up tomorrow",
    time: "Yesterday",
    unread: 0,
    online: true,
  },
];

type MsgType = "text" | "image" | "file" | "audio";

interface Message {
  id: number;
  from: "me" | "them";
  type: MsgType;
  content?: string;
  fileName?: string;
  fileSize?: string;
  audioDur?: string;
  imgSrc?: string;
  time: string;
}

const MESSAGES: Message[] = [
  {
    id: 1,
    from: "them",
    type: "text",
    content: "Hey! Did you finish the new dashboard designs?",
    time: "10:02 AM",
  },
  {
    id: 2,
    from: "me",
    type: "text",
    content: "Almost done — just finalising the dark mode tokens.",
    time: "10:04 AM",
  },
  {
    id: 3,
    from: "them",
    type: "image",
    imgSrc:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=320&q=80",
    content: "Check this reference screenshot for the colour palette 🎨",
    time: "10:06 AM",
  },
  {
    id: 4,
    from: "me",
    type: "text",
    content: "Love that palette. I'll pull the accent values from it.",
    time: "10:08 AM",
  },
  {
    id: 5,
    from: "them",
    type: "file",
    fileName: "design-system-v3.fig",
    fileSize: "4.2 MB",
    time: "10:10 AM",
  },
  {
    id: 6,
    from: "me",
    type: "file",
    fileName: "dashboard-export.pdf",
    fileSize: "1.8 MB",
    time: "10:12 AM",
  },
  { id: 7, from: "them", type: "audio", audioDur: "0:42", time: "10:15 AM" },
  {
    id: 8,
    from: "me",
    type: "text",
    content: "Got the voice note — will review and get back to you!",
    time: "10:17 AM",
  },
  {
    id: 9,
    from: "them",
    type: "text",
    content: "Send me the files when ready 📎",
    time: "10:20 AM",
  },
];

const fileIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const micIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const playIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const sendIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const imgIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const attachIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const searchIcon = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function MessagePage() {
  const [activeSession, setActiveSession] = useState(SESSIONS[0]);
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [input, setInput] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");
  const [msgSearch, setMsgSearch] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const recInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredSessions = SESSIONS.filter(
    (s) =>
      s.name.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.lastMsg.toLowerCase().includes(sessionSearch.toLowerCase()),
  );

  const filteredMessages = msgSearch
    ? messages.filter(
        (m) =>
          m.type === "text" &&
          m.content?.toLowerCase().includes(msgSearch.toLowerCase()),
      )
    : messages;

  const sendText = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: "me",
        type: "text",
        content: input.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInput("");
  };

  const startRecording = () => {
    setRecording(true);
    setRecordSecs(0);
    recInterval.current = setInterval(() => setRecordSecs((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    setRecording(false);
    if (recInterval.current) clearInterval(recInterval.current);
    const dur = `0:${String(recordSecs).padStart(2, "0")}`;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: "me",
        type: "audio",
        audioDur: dur,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setRecordSecs(0);
  };

  const sendImage = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: "me",
        type: "image",
        imgSrc:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=320&q=80",
        content: "Shared an image",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const sendFile = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: "me",
        type: "file",
        fileName: "document.pdf",
        fileSize: "2.4 MB",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const fmtSecs = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex h-[calc(100vh-156px)]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2840; border-radius: 4px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes ripple { 0% { transform: scale(0.95); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
        .msg-bubble { animation: fadeUp 0.2s ease; }
        .tool-btn { transition: all 0.15s; border-radius: 10px; }
        .tool-btn:hover { background: rgba(139,92,246,0.15) !important; color: #c4b5fd !important; }
        .send-btn { transition: all 0.18s; }
        .send-btn:hover { background: #7c3aed !important; transform: scale(1.05); }
        .search-input::placeholder { color: #4a4866; }
        .search-input:focus { outline: none; border-color: #5b4fcf !important; }
        .text-input:focus { outline: none; }
        .text-input::placeholder { color: #4a4866; }
        .waveform-bar { display: inline-block; width: 3px; border-radius: 2px; background: currentColor; margin: 0 1px; }
      `}</style>

      {/* ── LEFT PANEL: Sessions ── */}
      <div className="w-80 flex flex-col pr-4">
        {/* Header */}

        <div className="relative">
          <Input
            value={sessionSearch}
            onChange={(e) => setSessionSearch(e.target.value)}
            placeholder="Search conversations…"
            className="h-9 !pl-8"
          />
          <Search
            size={14}
            className="opacity-50 absolute top-1/2 -translate-y-1/2 left-2.5"
          />
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
          {filteredSessions.map((s) => (
            <div
              key={s.id}
              className={`cursor-pointer flex items-center gap-3 py-3.5 px-3 rounded-2xl ${activeSession.id === s.id ? "bg-blue-500/15" : "hover:bg-blue-500/10 tr"}`}
              onClick={() => setActiveSession(s)}
            >
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div
                  className={cn(
                    "center h-10 w-10 text-xs font-bold rounded-full ",
                  )}
                  style={{
                    background: `${s.color}22`,
                    border: `1.5px solid ${s.color}44`,
                    color: s.color,
                  }}
                >
                  {s.avatar}
                </div>
                {s.online && (
                  <span className="absolute bottom-[1px] right-[1px] h-2.5 w-2.5 bg-green-500 rounded-full" />
                )}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flbx">
                  <span
                    className={cn(
                      "text-sm font-semibold truncate",
                      activeSession.id === s.id ? "opacity-100" : "opacity-70",
                    )}
                  >
                    {s.name}
                  </span>
                  <span style={{ fontSize: 11, color: "#4a4866" }}>
                    {s.time}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <span
                    className={cn(
                      "text-xs truncate",
                      activeSession.id === s.id ? "opacity-80" : "opacity-60",
                    )}
                  >
                    {s.lastMsg}
                  </span>
                  {s.unread > 0 && (
                    <span
                      style={{
                        background: "#8b5cf6",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 10,
                        padding: "1px 6px",
                        minWidth: 18,
                        textAlign: "center",
                      }}
                    >
                      {s.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL: Chat ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-4 flex justify-between items-center border-b border-b-gray-200 pb-4">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: activeSession.isGroup ? 11 : "50%",
                  background: `${activeSession.color}22`,
                  border: `1.5px solid ${activeSession.color}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  color: activeSession.color,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {activeSession.avatar}
              </div>
              {activeSession.online && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 1,
                    right: 1,
                    width: 9,
                    height: 9,
                    background: "#34d399",
                    borderRadius: "50%",
                    border: "1.5px solid #0f0e18",
                  }}
                />
              )}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {activeSession.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: activeSession.online ? "#34d399" : "#4a4866",
                }}
              >
                {activeSession.online ? "Online now" : "Offline"}
              </div>
            </div>
          </div>

          {/* Message search toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {showMsgSearch && (
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#4a4866",
                  }}
                >
                  {searchIcon}
                </span>
                <input
                  className="search-input"
                  autoFocus
                  value={msgSearch}
                  onChange={(e) => setMsgSearch(e.target.value)}
                  placeholder="Search messages…"
                  style={{
                    padding: "7px 10px 7px 30px",
                    width: 200,
                    background: "#16152a",
                    border: "1px solid #231f3a",
                    borderRadius: 9,
                    color: "#e8e6f0",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                />
              </div>
            )}
            <button
              className="tool-btn"
              onClick={() => {
                setShowMsgSearch((v) => !v);
                setMsgSearch("");
              }}
              style={{
                background: showMsgSearch
                  ? "rgba(139,92,246,0.15)"
                  : "transparent",
                border: "none",
                color: showMsgSearch ? "#c4b5fd" : "#4a4866",
                cursor: "pointer",
                padding: "7px 9px",
                display: "flex",
              }}
              title="Search messages"
            >
              {searchIcon}
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto py-6 px-7 flex flex-col gap-1.5">
          {filteredMessages.map((msg, i) => {
            const isMe = msg.from === "me";
            const showDate = i === 0;
            return (
              <div key={msg.id}>
                {showDate && (
                  <div
                    style={{
                      textAlign: "center",
                      margin: "8px 0 16px",
                      fontSize: 11,
                      color: "#4a4866",
                    }}
                  >
                    Today
                  </div>
                )}
                <div
                  className="msg-bubble"
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    marginBottom: 2,
                  }}
                >
                  {!isMe && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: `${activeSession.color}22`,
                        border: `1px solid ${activeSession.color}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 600,
                        color: activeSession.color,
                        marginRight: 8,
                        alignSelf: "flex-end",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {activeSession.avatar}
                    </div>
                  )}
                  <div style={{ maxWidth: "62%" }}>
                    {/* Image */}
                    {msg.type === "image" && (
                      <div
                        style={{
                          borderRadius: isMe
                            ? "16px 16px 4px 16px"
                            : "16px 16px 16px 4px",
                          overflow: "hidden",
                          border: "1px solid #231f3a",
                        }}
                      >
                        <img
                          src={msg.imgSrc}
                          alt=""
                          style={{
                            display: "block",
                            width: "100%",
                            maxWidth: 240,
                          }}
                        />
                        {msg.content && (
                          <div
                            style={{
                              padding: "8px 12px",
                              background: isMe ? "#2d1f6e" : "#16152a",
                              fontSize: 13,
                              color: "#c4b5fd",
                            }}
                          >
                            {msg.content}
                          </div>
                        )}
                      </div>
                    )}
                    {/* File */}
                    {msg.type === "file" && (
                      <div
                        style={{
                          background: isMe ? "#2d1f6e" : "#16152a",
                          border: `1px solid ${isMe ? "#5b4fcf" : "#231f3a"}`,
                          borderRadius: isMe
                            ? "16px 16px 4px 16px"
                            : "16px 16px 16px 4px",
                          padding: "10px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 9,
                            background: isMe ? "#4c2d9e" : "#231f3a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isMe ? "#a78bfa" : "#6b7280",
                            flexShrink: 0,
                          }}
                        >
                          {fileIcon}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#e8e6f0",
                            }}
                          >
                            {msg.fileName}
                          </div>
                          <div style={{ fontSize: 11, color: "#4a4866" }}>
                            {msg.fileSize}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Audio */}
                    {msg.type === "audio" && (
                      <div
                        style={{
                          background: isMe ? "#2d1f6e" : "#16152a",
                          border: `1px solid ${isMe ? "#5b4fcf" : "#231f3a"}`,
                          borderRadius: isMe
                            ? "16px 16px 4px 16px"
                            : "16px 16px 16px 4px",
                          padding: "10px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          minWidth: 180,
                        }}
                      >
                        <button
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            border: "none",
                            background: isMe ? "#8b5cf6" : "#4a4866",
                            color: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {playIcon}
                        </button>
                        {/* Fake waveform */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0,
                            flex: 1,
                          }}
                        >
                          {[3, 5, 8, 6, 10, 7, 4, 9, 5, 6, 8, 3, 7, 5, 9].map(
                            (h, k) => (
                              <span
                                key={k}
                                className="waveform-bar"
                                style={{
                                  height: h * 2,
                                  opacity: 0.6,
                                  color: isMe ? "#a78bfa" : "#6b7280",
                                }}
                              />
                            ),
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#4a4866",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {msg.audioDur}
                        </span>
                      </div>
                    )}
                    {/* Text */}
                    {msg.type === "text" && (
                      <div
                        style={{
                          background: isMe ? "#2d1f6e" : "#16152a",
                          border: `1px solid ${isMe ? "#5b4fcf40" : "#231f3a"}`,
                          borderRadius: isMe
                            ? "16px 16px 4px 16px"
                            : "16px 16px 16px 4px",
                          padding: "9px 14px",
                          fontSize: 14,
                          lineHeight: 1.5,
                          color: isMe ? "#ddd6fe" : "#c4c0da",
                        }}
                      >
                        {msg.content}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 10,
                        color: "#4a4866",
                        marginTop: 4,
                        textAlign: isMe ? "right" : "left",
                      }}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* ── Compose Bar ── */}
        <div className="border-t border-t-gray-200 pt-4">
          {recording && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                marginBottom: 10,
                background: "#1a0d30",
                border: "1px solid #5b4fcf",
                borderRadius: 12,
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f87171",
                  animation: "pulse 1s infinite",
                  display: "inline-block",
                }}
              />
              <span style={{ color: "#f87171", fontWeight: 500 }}>
                Recording…
              </span>
              <span
                style={{
                  color: "#4a4866",
                  fontFamily: "'DM Mono', monospace",
                  marginLeft: "auto",
                }}
              >
                {fmtSecs(recordSecs)}
              </span>
              <button
                onClick={stopRecording}
                style={{
                  background: "#7c3aed",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            {/* Tools */}
            <div style={{ display: "flex", gap: 2, paddingBottom: 4 }}>
              <button
                className="tool-btn"
                onClick={sendImage}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#4a4866",
                  cursor: "pointer",
                  padding: "7px 8px",
                  display: "flex",
                }}
                title="Share image"
              >
                {imgIcon}
              </button>
              <button
                className="tool-btn"
                onClick={sendFile}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#4a4866",
                  cursor: "pointer",
                  padding: "7px 8px",
                  display: "flex",
                }}
                title="Attach file"
              >
                {attachIcon}
              </button>
              {!recording ? (
                <button
                  className="tool-btn"
                  onClick={startRecording}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#4a4866",
                    cursor: "pointer",
                    padding: "7px 8px",
                    display: "flex",
                  }}
                  title="Record audio"
                >
                  {micIcon}
                </button>
              ) : null}
            </div>

            {/* Input */}
            <div
              style={{
                flex: 1,

                border: "1px solid #231f3a",
                borderRadius: 14,
                padding: "10px 14px",
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <textarea
                className="text-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendText();
                  }
                }}
                placeholder="Write a message…"
                rows={1}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",

                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "none",
                  lineHeight: 1.5,
                  maxHeight: 120,
                  overflowY: "auto",
                }}
              />
            </div>

            {/* Send */}
            <button className="bg-blue-500 rounded-full center pt-2.5 pb-2 pl-2 pr-2.5 text-white" onClick={sendText}>
              {sendIcon}
            </button>
          </div>
          <p
            className="text-xs opacity-60 text-center mt-2"
          >
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
