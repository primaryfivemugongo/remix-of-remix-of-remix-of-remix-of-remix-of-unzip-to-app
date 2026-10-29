import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AnimatedCard } from "@/components/ui/animated-card";
import { PhotoDialog } from "@/components/ui/photo-dialog";
import { useAuth } from "@/hooks/useAuth";
import { 
  MessageCircle, 
  Send, 
  Phone,
  Video,
  Mail,
  Bell,
  Users,
  Calendar,
  BookOpen,
  Heart,
  Star,
  Smile,
  Reply,
  Forward,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Paperclip,
  Mic,
  Zap
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  sender: string;
  senderRole: 'teacher' | 'student' | 'parent' | 'admin';
  senderPhoto?: string;
  recipient: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isImportant: boolean;
  hasAttachment: boolean;
  type: 'message' | 'announcement' | 'reminder';
}

interface ChatMessage {
  id: string;
  sender: string;
  senderPhoto?: string;
  message: string;
  timestamp: string;
  isCurrentUser: boolean;
}

// Mock data
const mockMessages: Message[] = [
  {
    id: 'M001',
    sender: 'Ms. Sarah Johnson',
    senderRole: 'teacher',
    senderPhoto: null,
    recipient: 'All Students',
    subject: '🎉 Great Job on Math Test!',
    content: 'Congratulations everyone! Your math test results were amazing. Keep up the excellent work! 📚✨',
    timestamp: '2 hours ago',
    isRead: false,
    isImportant: true,
    hasAttachment: false,
    type: 'announcement'
  },
  {
    id: 'M002',
    sender: 'Principal Smith',
    senderRole: 'admin',
    senderPhoto: null,
    recipient: 'All Classes',
    subject: '📚 Library Reading Challenge',
    content: 'Join our exciting reading challenge this month! Read 5 books and win awesome prizes! 🏆📖',
    timestamp: '4 hours ago',
    isRead: true,
    isImportant: false,
    hasAttachment: true,
    type: 'announcement'
  },
  {
    id: 'M003',
    sender: 'Coach Mike',
    senderRole: 'teacher',
    senderPhoto: null,
    recipient: 'Sports Team',
    subject: '⚽ Soccer Practice Tomorrow',
    content: 'Don\'t forget soccer practice tomorrow at 3 PM! Bring water bottles and wear your sports shoes! 🥅',
    timestamp: '1 day ago',
    isRead: true,
    isImportant: false,
    hasAttachment: false,
    type: 'reminder'
  },
  {
    id: 'M004',
    sender: 'Art Teacher Luna',
    senderRole: 'teacher',
    senderPhoto: null,
    recipient: 'Class 5A',
    subject: '🎨 Art Project Due Friday',
    content: 'Remember to bring your colorful paintings for the art exhibition! Let your creativity shine! 🌈✨',
    timestamp: '2 days ago',
    isRead: false,
    isImportant: true,
    hasAttachment: false,
    type: 'reminder'
  }
];

const mockChatMessages: ChatMessage[] = [
  {
    id: 'C001',
    sender: 'Ms. Johnson',
    senderPhoto: null,
    message: 'Great work on your science project! 🔬',
    timestamp: '10:30 AM',
    isCurrentUser: false
  },
  {
    id: 'C002',
    sender: 'You',
    senderPhoto: null,
    message: 'Thank you! I loved learning about planets! 🪐✨',
    timestamp: '10:32 AM',
    isCurrentUser: true
  },
  {
    id: 'C003',
    sender: 'Ms. Johnson',
    senderPhoto: null,
    message: 'Would you like to present it to the class tomorrow?',
    timestamp: '10:33 AM',
    isCurrentUser: false
  },
  {
    id: 'C004',
    sender: 'You',
    senderPhoto: null,
    message: 'Yes please! That sounds exciting! 🎉',
    timestamp: '10:35 AM',
    isCurrentUser: true
  }
];

const Communication = () => {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("messages");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [chatMessage, setChatMessage] = useState("");

  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || message.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const unreadCount = mockMessages.filter(m => !m.isRead).length;
  const importantCount = mockMessages.filter(m => m.isImportant).length;

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Bell className="h-4 w-4" />;
      case 'reminder': return <Calendar className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'announcement': return "from-blue-400 to-cyan-400";
      case 'reminder': return "from-yellow-400 to-orange-400";
      default: return "from-green-400 to-emerald-400";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'teacher': return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case 'admin': return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case 'parent': return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const handleSendChat = () => {
    if (chatMessage.trim()) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", chatMessage);
      setChatMessage("");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  if (!userRole) return null;

  return (
    <DashboardLayout 
      userRole={userRole} 
      userName={userName || "Student"}
      photoUrl={photoUrl}
      onLogout={handleLogout}
    >
      <div className="space-y-4 md:space-y-6 animate-fade-in px-2 md:px-0">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="flex justify-center items-center gap-2">
            <MessageCircle className="h-12 w-12 md:h-16 md:w-16 text-blue-400 animate-pulse" />
            <Heart className="h-6 w-6 md:h-8 md:w-8 text-pink-400 animate-bounce" />
            <Users className="h-8 w-8 md:h-12 md:w-12 text-green-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent animate-scale-in">
            💬 Communication Hub 💬
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Stay connected with your teachers, friends, and school community! 
            Share ideas, get help, and celebrate together! ✨🎉
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AnimatedCard hoverAnimation="bounce" className="text-center">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-blue-400 to-purple-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-500">{mockMessages.length}</h3>
              <p className="text-muted-foreground">Total Messages</p>
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard hoverAnimation="bounce" delay={100} className="text-center">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-red-400 to-pink-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-500">{unreadCount}</h3>
              <p className="text-muted-foreground">Unread</p>
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard hoverAnimation="bounce" delay={200} className="text-center">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-500">{importantCount}</h3>
              <p className="text-muted-foreground">Important</p>
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard hoverAnimation="bounce" delay={300} className="text-center">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-green-400 to-teal-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-500">8</h3>
              <p className="text-muted-foreground">Active Chats</p>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Main Communication Interface */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Communication Center 💫
            </CardTitle>
            <CardDescription>
              Connect, share, and stay updated with your school community!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b p-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="messages" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Messages
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Quick Chat
                  </TabsTrigger>
                  <TabsTrigger value="compose" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Message
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="messages" className="p-6 space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search messages... 🔍"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Messages</SelectItem>
                      <SelectItem value="message">💬 Messages</SelectItem>
                      <SelectItem value="announcement">📢 Announcements</SelectItem>
                      <SelectItem value="reminder">⏰ Reminders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Messages List */}
                <div className="space-y-3">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No messages found</p>
                      <p className="text-sm">Try adjusting your search or filters!</p>
                    </div>
                  ) : (
                    filteredMessages.map((message, index) => (
                      <AnimatedCard
                        key={message.id}
                        hoverAnimation="float"
                        delay={index * 50}
                        className={`p-0 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          !message.isRead ? 'border-l-4 border-blue-400' : ''
                        }`}
                      >
                        <div className="flex items-start p-4 gap-4">
                          <PhotoDialog 
                            photoUrl={message.senderPhoto} 
                            userName={message.sender}
                            size="h-12 w-12"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{message.sender}</h4>
                                  <Badge variant="secondary" className={`text-xs ${getRoleColor(message.senderRole)}`}>
                                    {message.senderRole}
                                  </Badge>
                                  {message.isImportant && (
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  )}
                                </div>
                                <h3 className="font-medium text-primary">{message.subject}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {message.content}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                                <div className="flex gap-1">
                                  <Badge className={`bg-gradient-to-r ${getMessageColor(message.type)} text-white text-xs`}>
                                    {getMessageIcon(message.type)}
                                    <span className="ml-1 capitalize">{message.type}</span>
                                  </Badge>
                                  {message.hasAttachment && (
                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AnimatedCard>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="chat" className="p-6">
                <div className="flex flex-col h-96">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <PhotoDialog 
                        photoUrl={null} 
                        userName="Ms. Johnson"
                        size="h-10 w-10"
                      />
                      <div>
                        <h4 className="font-semibold">Ms. Johnson</h4>
                        <p className="text-sm text-muted-foreground">Online • Math Teacher</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {mockChatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!msg.isCurrentUser && (
                          <PhotoDialog 
                            photoUrl={msg.senderPhoto} 
                            userName={msg.sender}
                            size="h-8 w-8"
                          />
                        )}
                        <div
                          className={`max-w-xs rounded-lg p-3 ${
                            msg.isCurrentUser
                              ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-foreground'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.isCurrentUser ? 'text-blue-100' : 'text-muted-foreground'
                            }`}
                          >
                            {msg.timestamp}
                          </p>
                        </div>
                        {msg.isCurrentUser && (
                          <PhotoDialog 
                            photoUrl={photoUrl} 
                            userName={userName || "You"}
                            size="h-8 w-8"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Input 
                        placeholder="Type your message... ✨"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendChat} disabled={!chatMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="compose" className="p-6">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-blue-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">Compose New Message 📝</h3>
                    <p className="text-sm text-muted-foreground">Share your thoughts with teachers and friends!</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">To 👥</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teacher">👩‍🏫 My Teacher</SelectItem>
                          <SelectItem value="class">🎓 My Class</SelectItem>
                          <SelectItem value="friend">👫 Friends</SelectItem>
                          <SelectItem value="parent">👨‍👩‍👧‍👦 Parents</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Type 📋</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Message type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="question">❓ Question</SelectItem>
                          <SelectItem value="sharing">🎉 Sharing</SelectItem>
                          <SelectItem value="help">🆘 Need Help</SelectItem>
                          <SelectItem value="thanks">🙏 Thank You</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject ✨</label>
                    <Input placeholder="What's your message about? 🌟" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message 💭</label>
                    <Textarea 
                      placeholder="Write your message here... Be kind and positive! 💝"
                      rows={6}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4 mr-1" />
                        Attach File
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Smile className="h-4 w-4 mr-1" />
                        Add Emoji
                      </Button>
                    </div>
                    <Button className="bg-gradient-to-r from-green-400 to-blue-400 text-white">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message 🚀
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Fun Communication Footer */}
        <Card className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 text-white overflow-hidden">
          <CardContent className="p-8 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-purple-600/20" />
            <div className="relative z-10">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold mb-2">Communication Makes Everything Better! 💫</h3>
              <p className="text-lg opacity-90">
                Keep sharing, keep caring, and keep growing together! 
                Your voice matters in our amazing school family! 🏫❤️
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Communication;