import {
  PiHouseLight,
  PiBellLight,
  PiUserLight,
  PiHouseFill,
  PiBellFill,
  PiUserFill,
} from "react-icons/pi";
import { NavLink } from "react-router-dom";
import { HiDotsHorizontal } from "react-icons/hi";
import { LuLogOut } from "react-icons/lu";
import SocietifySvg from "../svgs/societify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

const Sidebar = () => {
  const queryClient = useQueryClient();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  return (
    <div className="md:flex-[2_2_0] max-w-[275px] px-2">
      <div className="sticky top-0 left-0 flex flex-col justify-between max-md:items-center h-screen md:w-full">
        <div className="">
          <NavLink to="/" className="flex justify-center md:justify-start py-2">
            <SocietifySvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
          </NavLink>
          <ul className="flex flex-col gap-3 w-fit">
            <li className="flex justify-center md:justify-start">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex gap-4 items-center hover:bg-stone-900 transition-all rounded-full duration-400 py-2 pl-2 md:pr-4 pr-2 max-w-fit cursor-pointer ${
                    isActive ? "font-bold" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <PiHouseFill className="w-8 h-8" />
                    ) : (
                      <PiHouseLight className="w-8 h-8" />
                    )}
                    <span className="text-lg hidden md:block">Home</span>
                  </>
                )}
              </NavLink>
            </li>
            <li className="flex justify-center md:justify-start">
              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `flex gap-4 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 md:pr-4 pr-2 max-w-fit cursor-pointer ${
                    isActive ? "font-bold" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <PiBellFill className="w-8 h-8" />
                    ) : (
                      <PiBellLight className="w-8 h-8" />
                    )}
                    <span className="text-lg hidden md:block">
                      Notification
                    </span>
                  </>
                )}
              </NavLink>
            </li>
            <li className="flex justify-center md:justify-start">
              <NavLink
                to={`/profile/${authUser?.username}`}
                className={({ isActive }) =>
                  `flex gap-4 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 md:pr-4 pr-2 max-w-fit cursor-pointer ${
                    isActive ? "font-bold" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <PiUserFill className="w-8 h-8" />
                    ) : (
                      <PiUserLight className="w-8 h-8" />
                    )}
                    <span className="text-lg hidden md:block">Profile</span>
                  </>
                )}
              </NavLink>
            </li>
          </ul>
        </div>
        {authUser && (
          <div className="my-3 flex md:gap-3 gap-0 justify-between items-start transition-all duration-300 hover:bg-[#181818] p-3 rounded-full">
            <NavLink
              to={`/profile/${authUser.username}`}
              className="flex items-center gap-3"
            >
              <div className="avatar">
                <div className="w-10 h-10 rounded-full">
                  <img
                    src={authUser?.profileImg || "/avatar-placeholder.png"}
                  />
                </div>
              </div>
              <div className="hidden md:block">
                <p className="text-white font-bold text-sm w-full truncate">
                  {authUser?.fullName}
                </p>
                <p className="text-slate-500 text-sm">@{authUser?.username}</p>
              </div>
            </NavLink>
            <div className="flex justify-center items-center h-full">
              <div className="dropdown dropdown-top dropdown-start">
                <div tabIndex={0}>
                  <HiDotsHorizontal className="w-5 h-5 cursor-pointer hidden md:block" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border border-gray-700"
                >
                  <li>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        logout();
                      }}
                    >
                      <LuLogOut />
                      Logout
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
