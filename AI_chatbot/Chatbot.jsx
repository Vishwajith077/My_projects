import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const callGeminiApi = async (currentPrompt, retries = 0) => {
    const payload = {
      contents: [{ role: 'user', parts: [{ text: currentPrompt }] }],
    };

    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (retries < 5) {
          const delay = Math.pow(2, retries) * 1000;
          await new Promise(res => setTimeout(res, delay));
          return callGeminiApi(currentPrompt, retries + 1);
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
      } else {
        return "No response from AI.";
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return `Failed to get response: ${error.message}`;
    }
  };

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', text: prompt }]);
    setPrompt('');

    try {
      const aiResponse = await callGeminiApi(prompt);
      setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', text: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-inter">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>
        {`
          html, body, #root {
            height: 100%;
          }
          body { font-family: 'Inter', sans-serif; }
          .min-h-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .chat-container {
            max-width: 800px;
            width: 100%;
            height: 90vh;
            display: flex;
            flex-direction: column;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            background-color: #fff;
          }
          .chat-history {
            flex-grow: 1;
            padding: 1.5rem;
            overflow-y: auto;
            scroll-behavior: smooth;
          }
          .message {
            margin-bottom: 1rem;
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            max-width: 80%;
            word-wrap: break-word;
          }
          .user-message {
            background-color: #e0f2fe;
            align-self: flex-end;
            margin-left: auto;
            border-bottom-right-radius: 0.25rem;
          }
          .ai-message {
            background-color: #f3f4f6;
            align-self: flex-start;
            margin-right: auto;
            border-bottom-left-radius: 0.25rem;
          }
          .input-area {
            display: flex;
            padding: 1rem;
            border-top: 1px solid #e5e7eb;
            background-color: #fff;
            flex-shrink: 0;
          }
          textarea {
            flex-grow: 1;
            border: 1px solid #d1d5db;
            border-radius: 0.75rem;
            padding: 0.75rem 1rem;
            resize: none;
            overflow-y: auto;
            min-height: 48px;
            transition: all 0.2s ease-in-out;
          }
          textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }
          .send-button {
            margin-left: 0.75rem;
            background-color: #3b82f6;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease-in-out;
          }
          .send-button:hover:not(:disabled) {
            background-color: #2563eb;
          }
          .send-button:disabled {
            background-color: #93c5fd;
            cursor: not-allowed;
          }
          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #fff;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @media (max-width: 768px) {
            .chat-container {
              height: 95vh;
            }
            .send-button {
              padding: 0.5rem 1rem;
              font-size: 0.9rem;
            }
          }
        `}
      </style>

      <div className="chat-container">
        <div className="chat-history">
          {chatHistory.length === 0 && (
            <div className="text-center text-gray-500 italic mt-4">
              Start a conversation with the AI!
            </div>
          )}
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="input-area">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            rows="1"
            disabled={isLoading}
          ></textarea>
          <button
            onClick={handleSend}
            className="send-button"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
