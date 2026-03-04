import ChatRoomPage from './ChatRoom';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function Page() {
  return <ChatRoomPage />;
}
