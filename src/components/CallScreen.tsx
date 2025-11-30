import RegNav from "./RegNav";

export default function Text() {
  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="w-[50%] bg-white flex align-middle justify-center">
        <img
          width={"80%"}
          height={"80%"}
          className="object-contain"
          src="/tapo-call-image.png"
          alt="call"
        />
      </div>
      <div className="w-full h-screen bg-[#33BEE7] flex md:items-center md:justify-center">
        <div className="flex flex-col gap-5 w-[70] mx-auto items-center justify-center">
          <div className="flex items-center gap-4 justify-center">
            <img src="/callIcon.png" alt="message-icon" />
            <span className="font-rubik text-[31.6px] leading-[37.44px] font-light text-white">
              Message
            </span>
          </div>
          <div className="text-center">
            <span className="font-rubik text-white font-normal text-[14.74px] leading[21.06px] text-center">
              Reach out to friends and loved ones via voice or video call{" "}
            </span>
          </div>
          <div className="mt-[20%] w-full">
            <RegNav />
          </div>
        </div>
      </div>
    </div>
  );
}
