const StatusRing = ({
  count,
  viewed,
  size = 60,
  profilePic,
  displayName,
}: {
  count: number;
  viewed?: boolean;
  size?: number;
  profilePic?: string;
  displayName?: string;
}) => {
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segmentGap = 4;
  const segmentLength = (circumference - count * segmentGap) / count;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {[...Array(count)].map((_, index) => {
          const dashOffset = -(segmentLength + segmentGap) * index;
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={viewed ? "#A3A3A3" : "#10B981"}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all"
            />
          );
        })}
      </svg>
      <img
        src={
          profilePic ||
          `https://ui-avatars.com/api/?name=${displayName}&background=random`
        }
        alt="My Profile"
        className="w-full h-full object-cover rounded-full absolute inset-0 p-1"
      />
    </div>
  );
};

export default StatusRing;
