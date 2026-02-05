export type FindUserResponse = {
  matched: boolean;
  user: {
    _id: string;
    email: string;
    profilePic: string | null;
  };
};

export type VerifyOtpResponse = {
  message: string;
  email: string;
  hashedEmail: string;
  isNewUser: boolean;
  accessToken?: string;
  refreshToken?: string;
};

export type User = {
  meta: {
    unreadCount: number;
  };
  _id: string;
  displayName: string;
  email: string;
  profilePic: string | null;
  lastSeen: string;
  status: string;
  toured: boolean;
};

export type UserResponse = {
  status: true;
  user: User;
};

export type Contact = {
  _id: string;
  email: string;
  isBlocked: boolean;
  localName: string;
  contactProfile: {
    _id: string;
    displayName: string;
    profilePic: string | null;
    lastSeen: string;
  };
  blockedMe: boolean;
};

export type ContactListResponse = {
  message: string;
  success: boolean;
  contacts: Contact[];
};

export type AddContactResponse = {
  message: string;
  success: boolean;
  contact: Contact;
};

export type FindContactResponse = {
  matched: boolean;
  user: Partial<User>;
  conversationId: string;
};

export type Participant = {
  _id: string;
  displayName: string;
  email: string;
  profilePic: string | null;
  about?: string;
};

export type Attachment = {
  format: string;
  url: string;
  name?: string;
  size?: number;
  duration?: number;
  fileName?: string;
  height?: number;
  width?: number;
};

export type Conversation = {
  _id: string;
  roomId: string;
  creator: string | null;
  __v: number;
  createdAt: string;
  lastMessageAt: string;
  participants: Array<Participant>;
  title: string;
  updatedAt: string;
  lastMessage: {
    _id: string;
    conversation: string;
    from: string;
    message: string;
    ts: string;
    attachments?: Array<Attachment>;
    status: "sent" | string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
};

export type ConversationResponse = {
  status: boolean;
  conversations: Conversation[];
};

export type Message = {
  _id: string;
  conversation: string;
  from: {
    _id: string;
    displayName: string;
    email: string;
    profilePic: string | null;
  };
  message: string;
  ts: string;
  attachments?: Array<Attachment>;
  status: "sent" | string;
  taggedMessage: TaggedMessage;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type TaggedMessage = Message;

export type ChatMessage = {
  id?: string;
  _id?: string;
  tempId?: string;
  conversation?: string;
  conversationId?: string;
  from:
    | string
    | {
        _id: string;
        displayName?: string;
        email?: string;
        profilePic?: string | null;
      };
  message: string;
  ts: string;
  status?: string;
  taggedMessage?: TaggedMessage | { _id?: string; message: string; from: any };
  attachments?: Array<Attachment>;
};

export type MessageResponse = {
  status: boolean;
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
};

export type CloudinaryUploadResponse = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: [];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  asset_folder: string;
  display_name: string;
  original_filename: string;
  eager: [
    {
      transformation: string;
      width: number;
      height: number;
      bytes: number;
      format: string;
      url: string;
      secure_url: string;
    },
  ];
  api_key: string;
};

export type Status = {
  _id: string;
  userId: string;
  publicId: string;
  url: string;
  resourceType: string;
  caption: string;
  expiresAt: string;
  viewers: Array<string>;
  createdAt: string;
  __v: number;
};

export type VisibleStatus = {
  _id: string;
  displayName: string;
  profilePic: string | null;
  latest: string;
  total: number;
  statuses: Array<Status>;
};

export type StatusResponse = {
  status: true;
  mine: Array<Status>;
  visible: Array<VisibleStatus>;
};

export type Settings = {
  _id: string;
  userId: string;
  __v: number;
  createdAt: string;
  language: string;
  notification: boolean;
  theme: Theme;
  updatedAt: string;
};

export type SettingsResponse = {
  status: true;
  settings: Settings;
};

export type Theme = "system" | "light" | "dark";

export type ThemeChangeSettings = {
  status: true;
  settings: { _id: string };
};

export type CallType = "audio" | "video";

export type IncomingCall = {
  from: string;
  type: CallType;
  offer: RTCSessionDescriptionInit;
};
