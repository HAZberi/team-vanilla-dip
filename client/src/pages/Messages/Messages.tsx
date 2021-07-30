import React, { useState, useEffect, ChangeEvent } from 'react';
import useStyles from './useStyles';
import fetchConversations from '../../helpers/APICalls/getConversations';
import createConvo from '../../helpers/APICalls/createNewConvo';
import { Conversation } from '../../interface/Conversation';
import { User } from '../../interface/User';
import { useSocket } from '../../context/useSocketContext';
import { useAuth } from '../../context/useAuthContext';
import Navbar from '../../components/Navbar/Navbar';
import SearchUsers from '../../components/Search/Search';
import ConversationListItem from './Conversation/Conversation';
import MessagingContainer from './Messaging/MessagingContainer';

import { Typography, Grid, CssBaseline, Divider, Paper, List } from '@material-ui/core';

export default function Messages(): JSX.Element {
  const classes = useStyles();
  const { socket } = useSocket();
  const { loggedInUser } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvo, setCurrentConvo] = useState<Conversation | null>(null);
  const [search, setSearch] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [newParticipant, setNewParticipant] = useState<User | null>(null);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>, newInputValue: string) => {
    setSearch(newInputValue);
    const selectedUser = users.find((user) => user.username === newInputValue);

    if (selectedUser && selectedUser._id) {
      setNewParticipant(selectedUser);
      setSearch('');
    }
  };

  const saveConvos = (convos: Conversation[]) => {
    setConversations(convos);
  };

  useEffect(() => {
    if (socket) {
      socket.emit('addUser', loggedInUser?.id);
      // socket.on('getUsers', (users) => {
      //   console.log(users);
      // });
    }
  }, [socket, loggedInUser]);

  useEffect(() => {
    let active = true;

    const getAndSaveConvos = async () => {
      const response = await fetchConversations();

      if (active && response && response.conversations) {
        saveConvos(response.conversations);
      }
    };

    getAndSaveConvos();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (newParticipant?._id) {
      const createAndPushConvo = async () => {
        const response = await createConvo(newParticipant._id);

        if (active && response && response.conversation) {
          setCurrentConvo(response.conversation);
          const newConvos = [...conversations, response.conversation];
          saveConvos(newConvos);
        }
      };

      createAndPushConvo();
    }

    return () => {
      active = false;
    };
  }, [newParticipant, conversations]);

  return (
    <Grid container className={classes.root} direction="column" alignItems="center">
      <CssBaseline />
      <Grid item container>
        <Navbar />
      </Grid>
      <Grid item container>
        <Grid item xs={4}>
          <Paper elevation={2} className={classes.navOffset}>
            <Grid container direction="column">
              <Grid item xs={12} className={classes.convoBannerTitle}>
                <Typography variant="h5" style={{ fontWeight: 700 }}>
                  Inbox Messages
                </Typography>
              </Grid>
              <Grid item>
                <SearchUsers search={search} handleChange={handleSearchChange} options={users} setOptions={setUsers} />
              </Grid>
              <Divider />
              <Grid item className={classes.convoListContainer}>
                <List>
                  {conversations.map((convo) => {
                    return <ConversationListItem key={convo._id} convo={convo} setConvo={setCurrentConvo} />;
                  })}
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <Grid container direction="column" className={classes.navOffset}>
            {currentConvo ? (
              <MessagingContainer convo={currentConvo} />
            ) : (
              <>
                <Grid item container justifyContent="center" className={classes.startConvoTextContainer}>
                  <Grid item xs={6}>
                    <Typography variant="h5" style={{ fontWeight: 700 }}>
                      Open a conversation to start the chat.
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
