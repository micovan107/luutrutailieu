import React, { useState, useEffect } from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Button, Paper, List, ListItem, ListItemText, ListItemIcon, IconButton, TextField, Tabs, Tab } from '@mui/material';
import { Description, Delete, Upload, Add } from '@mui/icons-material';
import FileUpload from './components/FileUpload';
import Auth, { handleGoogleSignIn as authHandleGoogleSignIn } from './components/Auth';
import LandingPage from './components/LandingPage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => unsubscribe();
  }, []);

  const [documents, setDocuments] = useState(() => {
    try {
      const savedDocuments = localStorage.getItem(`documents_${user?.uid}`);
      if (savedDocuments) {
        const parsedDocuments = JSON.parse(savedDocuments);
        if (Array.isArray(parsedDocuments) && parsedDocuments.every(doc => doc.id && doc.title && doc.content)) {
          return parsedDocuments;
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải tài liệu từ localStorage:', error);
    }
    return [];
  });
  const [newDocument, setNewDocument] = useState({ title: '', content: '' });
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      try {
        if (Array.isArray(documents)) {
          localStorage.setItem(`documents_${user.uid}`, JSON.stringify(documents));
        }
      } catch (error) {
        console.error('Lỗi khi lưu tài liệu vào localStorage:', error);
      }
    }
  }, [documents, user?.uid]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAddDocument = () => {
    if (newDocument.title && newDocument.content) {
      setDocuments([...documents, { ...newDocument, id: Date.now() }]);
      setNewDocument({ title: '', content: '' });
    }
  };

  const handleDeleteDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleGoogleSignIn = async () => {
    const result = await authHandleGoogleSignIn();
    if (result) {
      setUser(result);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {!user ? (
        <LandingPage onSignIn={handleGoogleSignIn} />
      ) : (
        <>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Hệ thống lưu trữ tài liệu
              </Typography>
              <Auth user={user} setUser={setUser} />
            </Toolbar>
          </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ mb: 4 }}>
          <Tabs value={currentTab} onChange={handleTabChange} centered>
            <Tab label="Tài liệu văn bản" />
            <Tab label="Tệp tin" />
          </Tabs>
        </Paper>

        {currentTab === 0 ? (
          <>
            <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Thêm tài liệu mới
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tiêu đề"
              value={newDocument.title}
              onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
            />
            <TextField
              label="Nội dung"
              multiline
              rows={4}
              value={newDocument.content}
              onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddDocument}
              sx={{ alignSelf: 'flex-start' }}
            >
              Thêm tài liệu
            </Button>
          </Box>
            </Paper>
            <Paper>
              <List>
                {documents.map((doc) => (
                  <ListItem
                    key={doc.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleDeleteDocument(doc.id)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <Description />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.title}
                      secondary={doc.content}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </>
        ) : (
          <Paper sx={{ p: 2 }}>
            <FileUpload />
          </Paper>
        )}
      </Container>
        </>
      )}
    </Box>
  );
};

export default App;