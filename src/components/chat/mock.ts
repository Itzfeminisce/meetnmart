export const sampleChats = [
        {
            id: 1,
            name: 'John Doe',
            avatar: null,
            lastMessage: 'Hey, are you available for a quick call?',
            timestamp: '2 min ago',
            unread: 2,
            online: true,
            typing: false,
            pinned: true,
            messages: [
                { id: 1, text: 'Hello! How are you doing?', sender: 'other', timestamp: '10:30 AM', status: 'read' },
                { id: 2, text: 'I\'m doing great, thanks! How about you?', sender: 'me', timestamp: '10:32 AM', status: 'read' },
                { id: 3, text: 'Pretty good! I wanted to ask about the project we discussed', sender: 'other', timestamp: '10:35 AM', status: 'read' },
                { id: 4, text: 'Of course! I\'ve been working on it. Let me share the updates', sender: 'me', timestamp: '10:36 AM', status: 'read' },
                { id: 5, text: 'Hey, are you available for a quick call?', sender: 'other', timestamp: '10:45 AM', status: 'delivered' },
            ]
        },
        {
            id: 2,
            name: 'Sarah Wilson',
            avatar: null,
            lastMessage: 'Thanks for the help yesterday!',
            timestamp: '1 hour ago',
            unread: 0,
            online: false,
            typing: false,
            pinned: false,
            messages: [
                { id: 1, text: 'Hi Sarah! How did the presentation go?', sender: 'me', timestamp: '9:15 AM', status: 'read' },
                { id: 2, text: 'It went really well! The client loved our proposal', sender: 'other', timestamp: '9:20 AM', status: 'read' },
                { id: 3, text: 'That\'s fantastic news! Congratulations!', sender: 'me', timestamp: '9:21 AM', status: 'read' },
                { id: 4, text: 'Thanks for the help yesterday!', sender: 'other', timestamp: '9:22 AM', status: 'read' },
            ]
        },
        {
            id: 3,
            name: 'Mike Johnson',
            avatar: null,
            lastMessage: 'Let\'s schedule a meeting for next week',
            timestamp: '3 hours ago',
            unread: 1,
            online: true,
            typing: true,
            pinned: false,
            messages: [
                { id: 1, text: 'Good morning Mike!', sender: 'me', timestamp: '8:00 AM', status: 'read' },
                { id: 2, text: 'Morning! Ready for today\'s challenges?', sender: 'other', timestamp: '8:05 AM', status: 'read' },
                { id: 3, text: 'Always! What\'s on your agenda?', sender: 'me', timestamp: '8:06 AM', status: 'read' },
                { id: 4, text: 'Let\'s schedule a meeting for next week', sender: 'other', timestamp: '8:10 AM', status: 'delivered' },
            ]
        },
        {
            id: 4,
            name: 'Emma Davis',
            avatar: null,
            lastMessage: 'The documents are ready for review',
            timestamp: 'Yesterday',
            unread: 0,
            online: false,
            typing: false,
            pinned: false,
            messages: [
                { id: 1, text: 'Hi Emma, how\'s the project coming along?', sender: 'me', timestamp: 'Yesterday 4:30 PM', status: 'read' },
                { id: 2, text: 'Great progress! Almost done with the documentation', sender: 'other', timestamp: 'Yesterday 4:45 PM', status: 'read' },
                { id: 3, text: 'The documents are ready for review', sender: 'other', timestamp: 'Yesterday 5:00 PM', status: 'read' },
                { id: 4, text: '📎 project_docs.pdf', sender: 'other', timestamp: 'Yesterday 5:01 PM', status: 'read', type: 'file' },
            ]
        },
        {
            id: 5,
            name: 'Alex Chen',
            avatar: null,
            lastMessage: 'See you at the conference tomorrow',
            timestamp: '2 days ago',
            unread: 0,
            online: true,
            typing: false,
            pinned: false,
            messages: [
                { id: 1, text: 'Hey Alex! Are you attending the tech conference?', sender: 'me', timestamp: '2 days ago 2:00 PM', status: 'read' },
                { id: 2, text: 'Yes! I\'ll be presenting on AI trends', sender: 'other', timestamp: '2 days ago 2:15 PM', status: 'read' },
                { id: 3, text: 'That sounds exciting! I\'d love to attend your session', sender: 'me', timestamp: '2 days ago 2:16 PM', status: 'read' },
                { id: 4, text: 'See you at the conference tomorrow', sender: 'other', timestamp: '2 days ago 2:20 PM', status: 'read' },
            ]
        }
    ]