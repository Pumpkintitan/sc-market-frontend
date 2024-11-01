import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Grid,
  IconButton,
  Link as MaterialLink,
  Paper,
  PaperProps,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Message } from "../../datatypes/Chat"
import {
  useGetUserByUsernameQuery,
  useGetUserProfileQuery,
} from "../../store/profile"
import { getRelativeTime } from "../../util/time"
import { useMessagingSidebar } from "../../hooks/messaging/MessagingSidebar"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { ChevronLeftRounded } from "@mui/icons-material"
import { useCurrentChat } from "../../hooks/messaging/CurrentChat"
import { useSendChatMessageMutation } from "../../store/chats"
import { io } from "socket.io-client"
import { WS_URL } from "../../util/constants"
import { Stack } from "@mui/system"
import SCMarketLogo from "../../assets/scmarket-logo.png"

function MessageHeader() {
  const profile = useGetUserProfileQuery()
  const [messageSidebarOpen, setMessageSidebar] = useMessagingSidebar()

  const [chat] = useCurrentChat()

  const theme = useTheme<ExtendedTheme>()

  return (
    <Box
      sx={{
        width: "100%",
        padding: 2,
        paddingTop: 2,
        paddingLeft: 3,
        boxSizing: "border-box",
        borderWidth: 0,
        borderBottom: `solid 1px ${theme.palette.outline.main}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          display: "flex",
          overflow: "hide",
          width: "100%",
          maxWidth: "100%",
        }}
        alignItems={"center"}
      >
        {messageSidebarOpen !== undefined && (
          <IconButton
            color="secondary"
            aria-label="toggle market sidebar"
            onClick={() => {
              setMessageSidebar((v) => !v)
            }}
            sx={{ marginRight: 3 }}
          >
            {!messageSidebarOpen ? <MenuIcon /> : <ChevronLeftRounded />}
          </IconButton>
        )}

        <Tooltip
          title={chat!.participants
            .filter(
              (part) =>
                chat?.participants?.length === 1 ||
                part.username !== profile.data?.username,
            )
            .map((part) => part.username)
            .join(", ")}
        >
          <AvatarGroup max={3} spacing={"small"}>
            {chat!.participants
              .filter(
                (part) =>
                  chat?.participants?.length === 1 ||
                  part.username !== profile.data?.username,
              )
              .map((part) => (
                <Avatar
                  alt={part.username}
                  src={part.avatar}
                  key={part.username}
                />
              ))}
          </AvatarGroup>
        </Tooltip>

        <Box sx={{ marginLeft: 1, overflow: "hidden" }}>
          <Typography noWrap align={"left"} color={"text.secondary"}>
            {chat!.participants
              .filter(
                (part) =>
                  chat?.participants?.length === 1 ||
                  part.username !== profile.data?.username,
              )
              .map((part) => part.username)
              .join(", ")}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

// function MessageItem(props: { message: Message }) {
//     return (
//
//     )
// }

export function MsgPaper(
  props: PaperProps & {
    other?: boolean
    author:
      | {
          username: string
          avatar: string
        }
      | null
      | undefined
  },
) {
  const theme: Theme = useTheme()

  const { author, other, ...paperProps } = props

  if (author) {
    return (
      <Paper
        {...paperProps}
        sx={{
          bgcolor: other
            ? theme.palette.background.paper
            : theme.palette.secondary.main,
          padding: 1,
          paddingRight: 2,
          paddingLeft: 2,
          marginRight: 2,
          display: "inline-block",
          whiteSpace: "pre-line",
          borderRadius: 1.5,
          width: "100%",
        }}
      >
        <MaterialLink
          component={Link}
          to={`/user/${author?.username}`}
          color={
            other ? "text.secondary" : theme.palette.secondary.contrastText
          }
        >
          <Typography variant={"subtitle2"}>{author?.username}</Typography>
        </MaterialLink>

        {props.children}
      </Paper>
    )
  } else {
    return (
      <Paper
        {...paperProps}
        sx={{
          bgcolor: other
            ? theme.palette.background.paper
            : theme.palette.secondary.main,
          padding: 1,
          paddingRight: 2,
          paddingLeft: 2,
          marginRight: 2,
          display: "inline-block",
          whiteSpace: "pre-line",
          maxWidth: 400,
          flexGrow: 1,
          borderRadius: 1.5,
        }}
      >
        <Typography variant={"subtitle2"}>System</Typography>
        {props.children}
      </Paper>
    )
  }
}

function MessageEntry(props: { message: Message }) {
  const { message } = props
  const { data: profile } = useGetUserProfileQuery()
  const { data: author } = useGetUserByUsernameQuery(message.author!, {
    skip: !message.author,
  })
  const theme = useTheme<ExtendedTheme>()

  if (message.author === profile?.username) {
    return (
      <Stack
        direction={"row"}
        spacing={1.5}
        justifyContent={"flex-end"}
        sx={{ marginBottom: 4 }}
      >
        <Box sx={{ flexGrow: 1, maxWidth: "80%" }}>
          <MsgPaper author={author}>
            <Typography
              color={theme.palette.secondary.contrastText}
              align={"left"}
              width={"100%"}
              sx={{ fontWeight: 400, overflowWrap: "break-word" }}
            >
              {message.content}
            </Typography>
          </MsgPaper>
          <Typography
            align={"right"}
            color={"text.primary"}
            variant={"subtitle2"}
            sx={{
              marginTop: 0.5,
              marginRight: 4,
              fontSize: "0.75rem",
              lineHeight: 1.66,
            }}
          >
            {getRelativeTime(new Date(message.timestamp))}
          </Typography>
        </Box>

        <Link to={`/user/${message.author}`}>
          <Avatar
            variant="rounded"
            sx={{ width: 48, height: 48 }}
            src={author?.avatar}
          />
        </Link>
      </Stack>
    )
  } else if (!message.author) {
    return (
      <Stack
        direction={"row"}
        spacing={1.5}
        justifyContent={"flex-start"}
        sx={{ marginBottom: 4 }}
      >
        <Avatar
          variant="rounded"
          sx={{ width: 48, height: 48 }}
          src={SCMarketLogo}
        />
        <Box sx={{ flexGrow: 1, maxWidth: "80%" }}>
          <MsgPaper other author={author}>
            <Typography
              color={theme.palette.text.secondary}
              align={"left"}
              width={"100%"}
              sx={{ fontWeight: 400, overflowWrap: "break-word" }}
            >
              {message.content}
            </Typography>
          </MsgPaper>
          <Typography
            align={"left"}
            color={"text.primary"}
            variant={"subtitle2"}
            sx={{
              marginTop: 0.5,
              marginLeft: 2,
              fontSize: "0.75rem",
              lineHeight: 1.66,
            }}
          >
            {getRelativeTime(new Date(message.timestamp))}
          </Typography>
        </Box>
      </Stack>
    )
  } else {
    return (
      <Grid
        container
        spacing={1.5}
        justifyContent={"flex-start"}
        sx={{ marginBottom: 4 }}
      >
        <Grid item>
          <Link to={`/user/${message.author}`}>
            <Avatar
              variant="rounded"
              sx={{ width: 48, height: 48 }}
              src={author?.avatar}
            />
          </Link>
        </Grid>
        <Grid item>
          <MsgPaper other author={author}>
            <Typography
              color={theme.palette.text.secondary}
              align={"left"}
              width={"100%"}
              sx={{ fontWeight: 400, overflowWrap: "break-word" }}
            >
              {message.content}
            </Typography>
          </MsgPaper>
          <Typography
            align={"left"}
            color={"text.primary"}
            variant={"subtitle2"}
            sx={{
              marginTop: 0.5,
              marginLeft: 2,
              fontSize: "0.75rem",
              lineHeight: 1.66,
            }}
          >
            {getRelativeTime(new Date(message.timestamp))}
          </Typography>
        </Grid>
      </Grid>
    )
  }
}

function MessagesArea(props: {
  messages: Message[]
  messageEndRef: React.Ref<HTMLDivElement>
  maxHeight?: number
}) {
  const profile = useGetUserProfileQuery()
  const theme = useTheme<ExtendedTheme>()
  const { messageEndRef } = props

  const [chat] = useCurrentChat()

  useEffect(() => {
    if (!chat?.order_id) {
      // @ts-ignore
      messageEndRef?.current?.scrollIntoView({
        block: "end",
      })
    }
  }, [messageEndRef, chat])

  const { messages } = props
  return (
    <React.Fragment>
      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          padding: 4,
          borderColor: theme.palette.outline.main,
          boxSizing: "border-box",
          borderWidth: 0,
          borderStyle: "solid",
          overflow: "scroll",
          maxHeight: props.maxHeight,
        }}
      >
        {messages.map((message: Message) => (
          <MessageEntry message={message} key={message.timestamp} />
        ))}
        <div ref={props.messageEndRef} />
      </Box>
    </React.Fragment>
  )
}

function MessageSendArea(props: { onSend: (content: string) => void }) {
  const theme = useTheme<ExtendedTheme>()
  const [textEntry, setTextEntry] = useState("")

  return (
    <Box
      sx={{
        width: "100%",
        padding: 2,
        borderTopColor: theme.palette.outline.main,
        boxSizing: "border-box",
        borderWidth: 0,
        borderTop: `solid 1px ${theme.palette.outline.main}`,
        display: "flex",
        bgcolor: theme.palette.background.paper,
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        variant={"outlined"}
        sx={{ marginRight: 2 }}
        value={textEntry}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setTextEntry(event.target.value)
        }}
      />
      <Button
        variant={"outlined"}
        sx={{ maxHeight: 60 }}
        onClick={() => {
          props.onSend(textEntry)
          setTextEntry("")
        }}
      >
        Send
      </Button>
    </Box>
  )
}

export const socket = io(WS_URL, {
  withCredentials: true,
  path: "/ws",
  reconnectionDelay: 4000,
  autoConnect: false,
})

export function MessagesBody(props: { maxHeight?: number }) {
  const [currentChat, setCurrentChat] = useCurrentChat()
  const messageEndRef = useRef<HTMLDivElement>(null)
  const [isConnected, setIsConnected] = useState(false)

  const [sendChatMessage] = useSendChatMessageMutation()
  const { isSuccess } = useGetUserProfileQuery()

  useEffect(() => {
    if (isSuccess && !socket.connected) {
      socket.connect()
    }

    if (!isSuccess && socket.connected) {
      socket.disconnect()
    }
  }, [isSuccess])

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    function onServerMessage(message: Message): void {
      setCurrentChat(
        (chat) =>
          chat && {
            ...chat,
            messages: chat.messages.concat([message]),
          },
      )
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("serverMessage", onServerMessage)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("serverMessage", onServerMessage)
    }
  }, [])

  useEffect(() => {
    if (currentChat) {
      socket.emit("clientJoinRoom", { chat_id: currentChat.chat_id })
    }

    return () => {
      if (currentChat) {
        socket.emit("clientLeaveRoom", { chat_id: currentChat.chat_id })
      }
    }
  }, [currentChat?.chat_id])

  const onSend = useCallback(
    (content: string) => {
      if (content) {
        sendChatMessage({ chat_id: currentChat!.chat_id, content })
      }
    },
    [currentChat, sendChatMessage],
  )

  useEffect(() => {
    if (!currentChat?.order_id) {
      // @ts-ignore
      messageEndRef?.current?.scrollIntoView({
        // behavior: "smooth",
        block: "start",
      })
    }
  }, [currentChat])

  return (
    <>
      {currentChat && (
        <React.Fragment>
          <MessageHeader />
          <MessagesArea
            messages={currentChat.messages}
            messageEndRef={messageEndRef}
            maxHeight={props.maxHeight}
          />
          <MessageSendArea onSend={onSend} />
        </React.Fragment>
      )}
    </>
  )
}
