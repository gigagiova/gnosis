'use client'

import React, { useState } from 'react'

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")

  const sendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, inputValue])
      setInputValue("")
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="p-2 border-b border-gray-700">
            {msg}
          </div>
        ))}
      </div>
      <div className="flex p-2 border-t border-gray-700">
        <input
          type="text"
          className="flex-1 p-2 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const target = e.currentTarget as unknown as { value: string }
            setInputValue(target.value);
          }}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 p-2 bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel