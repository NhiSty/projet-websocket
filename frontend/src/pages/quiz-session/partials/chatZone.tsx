import { useUser } from "#/api/auth.queries";
import { Button } from "#/components/form/Button";
import { Input } from "#/components/form/Input";
import { useWsChat } from "#/providers/chat/chat";
import { UserInfo } from "#/providers/socketio/constants";
import { SendHorizonalIcon } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useState } from "react";

function ChatComposingIndicator({ users }: { users: UserInfo[] }) {
  const { data: user } = useUser();
  const [text, setText] = useState<ReactNode>("");

  useEffect(() => {
    const list = users; ///.filter((item) => item.id !== user?.id);

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

export function ChatZone(): JSX.Element {
  const { text, setText, sendMessage, composingUsers } = useWsChat();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Send chat message
    sendMessage();
  };

  return (
    <section className="p-2 pb-0 h-full w-full flex flex-col gap-4">
      <div className="rounded-lg flex-1"></div>

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
