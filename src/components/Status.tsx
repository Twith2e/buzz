import { LucideCamera, LucidePlus } from "lucide-react";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import StatusMediaPreview from "./StatusMediaPreview";
import StatusViewer from "./StatusViewer";
import {
  getCloudinarySignature,
  uploadFileToCloudinary,
} from "@/utils/cloudinary";
import { useSocketContext } from "@/contexts/SocketContext";
import { useUserContext } from "@/contexts/UserContext";
import { useStatusContext } from "@/contexts/StatusContext";
import { formatTime } from "@/lib/utils";
import { Status as StatusType, VisibleStatus } from "@/utils/types";
import StatusRing from "./StatusRing";

const Status = () => {
  const { status, setStatus } = useStatusContext();
  const { emit, on } = useSocketContext();
  const { user, contactList } = useUserContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewingStatus, setViewingStatus] = useState<Array<StatusType> | null>(
    null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
  };

  const handleSend = async (file: File, caption?: string) => {
    const signData = await getCloudinarySignature();
    const uploadResponse = await uploadFileToCloudinary(file, signData);

    if (!file) {
      console.log("must select image or video");
      return;
    }

    emit(
      "status:new",
      {
        userId: user?._id,
        media: {
          publicId: uploadResponse.public_id,
          url: uploadResponse.secure_url,
          thumbnailUrl: uploadResponse.url,
          resource_type: uploadResponse.resource_type,
        },
        caption: caption && caption,
      },
      (ack: {
        status: string;
        story: StatusType;
        recipients: Array<string>;
      }) => {
        if (ack.status === "error") {
          console.log("error", ack);
        } else if (ack.status === "success" || ack.status === "ok") {
          const story = ack.story;
          const status = {
            _id: story._id,
            userId: story.userId,
            publicId: story.publicId,
            url: story.url,
            resourceType: story.resourceType,
            caption: story.caption,
            viewers: story.viewers,
            expiresAt: story.expiresAt,
            createdAt: story.createdAt,
            __v: story.__v,
          };
          setStatus(
            (prev: {
              mine: Array<StatusType>;
              visible: Array<VisibleStatus>;
            }) => {
              return {
                ...prev,
                mine: [...(prev.mine || []), status],
              };
            }
          );
        } else {
          console.log(ack);
        }
      }
    );

    setSelectedFile(null);
  };

  useEffect(() => {
    const off = on(
      "status:incoming",
      (payload: {
        id: string;
        owner: string;
        caption: string;
        media: {
          publicId: string;
          url: string;
          thumbnailUrl: string;
          resource_type: string;
        };
        createdAt: string;
        expiresAt: string;
      }) => {
        console.log("status-payload: ", payload);

        setStatus(
          (prev: {
            mine: Array<StatusType>;
            visible: Array<VisibleStatus>;
          }) => {
            // Check if it's my status
            if (payload.owner === user?._id) {
              const status = {
                _id: payload.id,
                userId: payload.owner,
                publicId: payload.media.publicId,
                url: payload.media.url,
                resourceType: payload.media.resource_type,
                caption: payload.caption,
                viewers: [],
                expiresAt: payload.expiresAt,
                createdAt: payload.createdAt,
                __v: 0,
              };
              return {
                ...prev,
                mine: [...(prev.mine || []), status],
              };
            }
            // Check if it's visible (friend's status)=
            const newStatus = {
              _id: payload.id,
              userId: payload.owner,
              publicId: payload.media.publicId,
              url: payload.media.url,
              resourceType: payload.media.resource_type,
              caption: payload.caption,
              viewers: [],
              expiresAt: payload.expiresAt,
              createdAt: payload.createdAt,
              __v: 0,
            };

            const existingIndex = (prev.visible || []).findIndex(
              (s) => s._id === payload.owner
            );

            let newVisible = [...(prev.visible || [])];

            if (existingIndex !== -1) {
              const existing = newVisible[existingIndex];
              newVisible[existingIndex] = {
                ...existing,
                latest: newStatus.createdAt,
                total: existing.total + 1,
                statuses: [...existing.statuses, newStatus],
              };
            } else {
              newVisible = [
                {
                  _id: payload.owner,
                  displayName: contactList.find(
                    (contact) => contact.contactProfile._id === payload.owner
                  )?.localName,
                  profilePic: contactList.find(
                    (contact) => contact.contactProfile._id === payload.owner
                  )?.contactProfile?.profilePic,
                  latest: newStatus.createdAt,
                  total: 1,
                  statuses: [newStatus],
                },
                ...newVisible,
              ];
            }

            return {
              ...prev,
              visible: newVisible,
            };
          }
        );
      }
    );

    return off;
  }, [on, user?._id, setStatus, contactList]);

  const myLastStatus =
    status.mine?.length > 0 ? status.mine[status.mine.length - 1] : null;

  return (
    <>
      {viewingStatus && (
        <StatusViewer
          status={viewingStatus}
          onClose={() => setViewingStatus(null)}
        />
      )}
      {selectedFile && (
        <StatusMediaPreview
          file={selectedFile}
          onClose={handleClose}
          onSend={handleSend}
        />
      )}
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="px-6 py-4 flex justify-between items-center bg-gray-50 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">Updates</h1>
            <div className="flex gap-4">
              <label
                htmlFor="status-camera-header"
                className="cursor-pointer p-2 rounded-full hover:bg-gray-200 transition-colors"
                title="Add status"
              >
                <LucideCamera size={20} className="text-gray-600" />
                <input
                  type="file"
                  name="status-camera-header"
                  id="status-camera-header"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="p-6 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Status</h2>

            {/* My Status Row */}
            <div
              className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer -mx-2 transition-colors group"
              onClick={() => myLastStatus && setViewingStatus(status.mine)}
            >
              <StatusRing
                count={status.mine.length}
                viewed={false}
                profilePic={user?.profilePic}
                displayName={user?.displayName}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">My Status</h3>
                <p className="text-sm text-gray-500">
                  {myLastStatus
                    ? formatTime(myLastStatus.createdAt)
                    : "Tap to add status update"}
                </p>
              </div>
            </div>

            <hr className="my-6 border-gray-100" />

            {/* Recent Updates */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">
                Recent updates
              </h3>
              <div className="space-y-2">
                {status.visible?.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    No recent updates
                  </p>
                ) : (
                  status.visible?.map((s) => {
                    const contact = (contactList || []).find(
                      (c) => c.contactProfile._id === s._id
                    );
                    const displayName =
                      contact?.localName ||
                      contact?.contactProfile.displayName ||
                      "Unknown User";
                    const profilePic =
                      contact?.contactProfile.profilePic ||
                      `https://ui-avatars.com/api/?name=${displayName}&background=random`;

                    return (
                      <div
                        key={s._id}
                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer -mx-2 transition-colors"
                        onClick={() => setViewingStatus(s.statuses)}
                      >
                        <StatusRing
                          count={s.statuses.length}
                          displayName={displayName}
                          profilePic={profilePic}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {displayName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatTime(s.latest)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Status;
