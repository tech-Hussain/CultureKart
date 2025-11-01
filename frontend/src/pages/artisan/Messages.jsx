/**
 * Messages Page
 * Chat with buyers and handle inquiries
 */
import { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: 1,
      buyer: 'Ahmed Khan',
      lastMessage: 'Is this product available in blue color?',
      time: '10 mins ago',
      unread: 2,
    },
    {
      id: 2,
      buyer: 'Fatima Ali',
      lastMessage: 'Thank you for the quick delivery!',
      time: '1 hour ago',
      unread: 0,
    },
    {
      id: 3,
      buyer: 'Hassan Raza',
      lastMessage: 'Can you customize the size?',
      time: '2 hours ago',
      unread: 1,
    },
  ];

  const messages = {
    1: [
      { id: 1, sender: 'buyer', text: 'Hi! I love your carpet designs', time: '11:30 AM' },
      { id: 2, sender: 'artisan', text: 'Thank you! How can I help you?', time: '11:32 AM' },
      {
        id: 3,
        sender: 'buyer',
        text: 'Is this product available in blue color?',
        time: '11:35 AM',
      },
    ],
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log('Send message:', messageText);
    setMessageText('');
    // TODO: Implement message sending
  };

  return (
    <div className="h-[calc(100vh-12rem)]">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages & Inquiries</h1>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex h-full">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Conversations</h3>
          </div>
          <div>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conv.id ? 'bg-maroon-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-800">{conv.buyer}</p>
                  {conv.unread > 0 && (
                    <span className="w-6 h-6 bg-maroon-600 text-white text-xs rounded-full flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                <p className="text-xs text-gray-500 mt-1">{conv.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white">
                <h3 className="font-semibold">
                  {conversations.find((c) => c.id === selectedConversation)?.buyer}
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages[selectedConversation]?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'artisan' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender === 'artisan'
                          ? 'bg-maroon-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 opacity-75">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors flex items-center gap-2"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-6xl mb-4">💬</p>
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
