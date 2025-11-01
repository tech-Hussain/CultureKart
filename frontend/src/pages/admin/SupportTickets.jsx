import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  UserIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Support & Tickets Page
 * Manage user complaints and support tickets
 */
const SupportTickets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const tickets = [
    {
      id: 1001,
      subject: 'Payment Issue - Order #15672',
      user: 'Fatima Bibi',
      userType: 'buyer',
      priority: 'high',
      status: 'open',
      createdDate: '2024-06-26 10:30 AM',
      lastUpdated: '2024-06-26 02:15 PM',
      category: 'Payment',
      assignedTo: null,
      messages: [
        {
          sender: 'Fatima Bibi',
          message: 'My payment was deducted but order not confirmed',
          timestamp: '2024-06-26 10:30 AM',
        },
      ],
    },
    {
      id: 1002,
      subject: 'Product Quality Complaint',
      user: 'Mohammad Ali',
      userType: 'buyer',
      priority: 'medium',
      status: 'in-progress',
      createdDate: '2024-06-25 03:00 PM',
      lastUpdated: '2024-06-26 11:00 AM',
      category: 'Product',
      assignedTo: 'Support Agent 1',
      messages: [
        {
          sender: 'Mohammad Ali',
          message: 'Received damaged ceramic vase',
          timestamp: '2024-06-25 03:00 PM',
        },
        {
          sender: 'Support Agent 1',
          message: 'We are looking into this. Please provide photos.',
          timestamp: '2024-06-26 11:00 AM',
        },
      ],
    },
    {
      id: 1003,
      subject: 'Shipping Delay - Order #15650',
      user: 'Zainab Malik',
      userType: 'buyer',
      priority: 'low',
      status: 'resolved',
      createdDate: '2024-06-24 09:00 AM',
      lastUpdated: '2024-06-25 04:30 PM',
      category: 'Shipping',
      assignedTo: 'Support Agent 2',
      resolution: 'Contacted courier service and expedited delivery',
      messages: [
        {
          sender: 'Zainab Malik',
          message: 'Order not delivered on expected date',
          timestamp: '2024-06-24 09:00 AM',
        },
        {
          sender: 'Support Agent 2',
          message: 'Checking with courier service...',
          timestamp: '2024-06-24 02:00 PM',
        },
        {
          sender: 'Support Agent 2',
          message: 'Package will be delivered tomorrow. Sorry for the delay.',
          timestamp: '2024-06-25 04:30 PM',
        },
      ],
    },
    {
      id: 1004,
      subject: 'Account Verification Issue',
      user: 'Ahmed Khan',
      userType: 'artisan',
      priority: 'high',
      status: 'open',
      createdDate: '2024-06-26 01:00 PM',
      lastUpdated: '2024-06-26 01:00 PM',
      category: 'Account',
      assignedTo: null,
      messages: [
        {
          sender: 'Ahmed Khan',
          message: 'Cannot verify my artisan account. Documents already submitted.',
          timestamp: '2024-06-26 01:00 PM',
        },
      ],
    },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toString().includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
  };

  const handleAssign = (ticketId, agent) => {
    console.log('Assign ticket', ticketId, 'to', agent);
  };

  const handleResolve = (ticketId, resolution) => {
    console.log('Resolve ticket', ticketId, 'with', resolution);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      open: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
      resolved: 'bg-green-100 text-green-700 border-green-300',
      closed: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClasses[status]}`}>
        {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-orange-100 text-orange-700',
      low: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${priorityClasses[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Support & Tickets</h1>
        <p className="text-sm text-gray-600 mt-1">Manage user complaints and support requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Open Tickets</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {tickets.filter((t) => t.status === 'open').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {tickets.filter((t) => t.status === 'in-progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Resolved Today</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {tickets.filter((t) => t.status === 'resolved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">High Priority</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {tickets.filter((t) => t.priority === 'high').length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket ID, subject, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`bg-white rounded-lg shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${
              ticket.priority === 'high'
                ? 'border-red-500'
                : ticket.priority === 'medium'
                ? 'border-orange-500'
                : 'border-blue-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-800">
                    #{ticket.id} - {ticket.subject}
                  </h3>
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-600">User</p>
                      <p className="text-sm font-medium text-gray-800">
                        {ticket.user} ({ticket.userType})
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Category</p>
                    <p className="text-sm font-medium text-gray-800">{ticket.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Created</p>
                    <p className="text-sm font-medium text-gray-800">{ticket.createdDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Assigned To</p>
                    <p className="text-sm font-medium text-gray-800">{ticket.assignedTo || 'Unassigned'}</p>
                  </div>
                </div>

                {ticket.status === 'resolved' && ticket.resolution && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Resolution</p>
                        <p className="text-xs text-green-700 mt-1">{ticket.resolution}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4" />
                  <span>Last Updated: {ticket.lastUpdated}</span>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => handleViewTicket(ticket)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>View Details</span>
                </button>

                {ticket.status === 'open' && !ticket.assignedTo && (
                  <button
                    onClick={() => handleAssign(ticket.id, 'Support Agent 1')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Assign to Me
                  </button>
                )}

                {ticket.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolve(ticket.id, '')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Resolve</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Details Modal */}
      {showDetailsModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Ticket #{selectedTicket.id}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedTicket.subject}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-2">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Priority</p>
                  <div className="mt-2">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Conversation</h3>
                {selectedTicket.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      msg.sender === selectedTicket.user
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-800">{msg.sender}</p>
                      <p className="text-xs text-gray-600">{msg.timestamp}</p>
                    </div>
                    <p className="text-sm text-gray-700">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              {selectedTicket.status !== 'resolved' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Reply</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your response..."
                  ></textarea>
                  <div className="flex items-center space-x-3 mt-4">
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                      Send Reply
                    </button>
                    <button
                      onClick={() => handleResolve(selectedTicket.id, 'Issue resolved')}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              )}

              {/* Resolution Note (if resolved) */}
              {selectedTicket.status === 'resolved' && selectedTicket.resolution && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-800 mb-2">Resolution Note</p>
                  <p className="text-sm text-green-700">{selectedTicket.resolution}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
