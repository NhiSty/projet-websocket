import { useUser } from "#/api/auth.queries";
import { Button } from "#/components/form/Button";
import { Input } from "#/components/form/Input";
import { MessageData, useWsChat } from "#/providers/chat/chat";
import { UserInfo } from "#/providers/socketio/constants";
import { SendHorizonalIcon } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";

function ChatComposingIndicator({ users }: { users: UserInfo[] }) {
  const { data: user } = useUser();
  const [text, setText] = useState<ReactNode>("");

  useEffect(() => {
    const list = users.filter((item) => item.id !== user?.id);

    if (list.length === 1) {
      setText(
        <>
          <strong>{list[0].username}</strong> is writing...
        </>
      );
    } else if (list.length > 1 && list.length <= 4) {
      const others = list
        .slice(0, -1)
        .map((user) => <strong>{user.username}</strong>)
        .join(", ");
      setText(
        <>
          {others} and <strong>{list[list.length - 1].username}</strong> are
          writing...
        </>
      );
    } else if (list.length > 4) {
      setText("Many users are writing...");
    } else {
      setText("");
    }
  }, [users]);

  return (
    <div className="text-sm px-2 h-5">
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

function MessageItem({ data }: { data: MessageData }) {
  return (
    <div className="flex flex-col hover:bg-base-200 rounded-md p-2 px-4">
      <div className="flex flex-row gap-3">
        <div className="flex flex-col">
          <div className="flex flex-row gap-2 items-center leading-tight">
            <span className="font-semibold">{data.from.username}</span>
            <span className="text-gray-500 text-xs">
              {new Date(data.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="px-1">{data.content}</div>
        </div>
      </div>
    </div>
  );
}

export function ChatZone(): JSX.Element {
  const {
    text,
    setText,
    sendMessage,
    composingUsers,
    history,
    readNewMessages,
  } = useWsChat();
  const [messageSent, setMessageSent] = useState<boolean>(false);
  const listRef = useRef<HTMLDivElement>(null);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Send chat message
    sendMessage();
    setMessageSent(true);
  };

  useEffect(() => {
    readNewMessages();

    setTimeout(() => {
      if (messageSent) {
        setMessageSent(false);
        listRef.current?.scrollTo({
          top: listRef.current?.scrollHeight,
        });
      }
    }, 0);
  }, [readNewMessages, history, messageSent]);

  return (
    <section className="p-2 pb-0 flex flex-col h-full gap-3">
      {/* Chat list section */}
      <div className="flex-1 relative">
        <div
          className="absolute top-0 left-0 right-0 bottom-0 overflow-auto"
          ref={listRef}
        >
          {history.map((message) => (
            <MessageItem
              data={message}
              key={`${message.from.id}-${message.timestamp}`}
            />
          ))}
        </div>
      </div>

      {/* Chat Input form */}
      <form className="flex flex-col" onSubmit={onSubmit}>
        <div className="flex flex-row gap-2">
          <Input
            className="flex-1 max-w-none"
            placeholder="Type a message"
            onChange={(event) => setText(event.target.value)}
            value={text}
          />
          <Button className="btn-square" aria-label="Send">
            <SendHorizonalIcon className="w-5 h-5" />
          </Button>
        </div>

        <ChatComposingIndicator users={composingUsers} />
      </form>
    </section>
  );
}
