import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, AlertTriangle } from "lucide-react";
import { chatbotApi } from "../../api/endpoints";

const INITIAL_MESSAGE = {
  role: "bot",
  text: "Hi! I'm your AI Health Assistant. Ask me about symptoms, conditions, or how to use this site.",
  suggestions: ["I have a fever and cough", "What is hypertension?", "How do I check my symptoms?"],
};

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setSending(true);

    try {
      const res = await chatbotApi.sendMessage(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: res.data.reply,
          suggestions: res.data.suggestions || [],
          emergency: res.data.emergency,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I'm having trouble responding right now. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close health assistant chat" : "Open health assistant chat"}
        className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-clinical-600 hover:bg-clinical-700 text-white shadow-card-hover transition-transform hover:scale-105"
      >
        {open ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white dark:bg-clinical-900 rounded-2xl shadow-card-hover border border-clinical-100 dark:border-clinical-800 flex flex-col overflow-hidden animate-scaleIn">
          <div className="flex items-center gap-2.5 px-4 py-3.5 bg-clinical-600 text-white">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
              <Bot className="w-4.5 h-4.5" />
            </span>
            <div>
              <p className="font-semibold text-sm">Health Assistant</p>
              <p className="text-[11px] text-clinical-100">Offline guidance · not a doctor</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-clinical-600 text-white rounded-br-md"
                      : m.emergency
                      ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-md dark:bg-red-950/40 dark:text-red-200 dark:border-red-800"
                      : "bg-warmgray-100 dark:bg-clinical-800 text-warmgray-900 dark:text-clinical-100 rounded-bl-md"
                  }`}
                >
                  {m.emergency && (
                    <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" /> Possible emergency
                    </div>
                  )}
                  {m.text}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.suggestions.map((s, si) => (
                        <button
                          key={si}
                          onClick={() => sendMessage(s)}
                          className="text-[11px] px-2.5 py-1 rounded-full border border-clinical-300 dark:border-clinical-600 text-clinical-700 dark:text-clinical-200 hover:bg-clinical-50 dark:hover:bg-clinical-700 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-warmgray-100 dark:bg-clinical-800 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-clinical-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
                  <span className="w-1.5 h-1.5 bg-clinical-400 rounded-full animate-bounce [animation-delay:-0.1s]" />
                  <span className="w-1.5 h-1.5 bg-clinical-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 p-3 border-t border-clinical-100 dark:border-clinical-800"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe how you're feeling..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-warmgray-100 dark:bg-clinical-800 text-sm text-warmgray-900 dark:text-clinical-100 placeholder:text-warmgray-400 focus:outline-none focus:ring-2 focus:ring-clinical-400"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-clinical-600 hover:bg-clinical-700 disabled:bg-clinical-300 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
