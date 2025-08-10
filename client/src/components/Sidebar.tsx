import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const sidebarLinks = [
	{
		to: "/",
		label: "Dashboard",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24px"
				height="24px"
				fill="currentColor"
				viewBox="0 0 256 256"
			>
				<path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
			</svg>
		),
		match: (pathname: string) => pathname === "/",
		gradient: "bg-[#1E293B]",
	},
	{
		to: "/orders",
		label: "Orders",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24px"
				height="24px"
				fill="currentColor"
				viewBox="0 0 256 256"
			>
				<path d="M247.42,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,247.42,117ZM184,88h34.58l9.6,24H184ZM24,72H168v64H24ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208Zm81-24H103a32,32,0,0,0-62,0H24V152H168v12.31A32.11,32.11,0,0,0,153,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,184,208Zm48-24H215a32.06,32.06,0,0,0-31-24V128h48Z"></path>
			</svg>
		),
		match: (pathname: string) => pathname.startsWith("/orders"),
		gradient: "bg-[#1E293B]",

	},
	{
		to: "/products",
		label: "Products",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24px"
				height="24px"
				fill="currentColor"
				viewBox="0 0 24 24"
			>
				<path d="M21.41 7.41l-8-6a2 2 0 0 0-2.82 0l-8 6A2 2 0 0 0 2 9.13V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9.13a2 2 0 0 0-.59-1.72zM12 4.15L18.74 9H5.26zm8 15.85H4V9.87l8 6 8-6z" />
			</svg>
		),
		match: (pathname: string) => pathname.startsWith("/products"),
		gradient: "bg-[#1E293B]",
	},
	{
		to: "/customers",
		label: "Customers",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24px"
				height="24px"
				fill="currentColor"
				viewBox="0 0 256 256"
			>
				<path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
			</svg>
		),
		match: (pathname: string) => pathname.startsWith("/customers"),
		gradient: "bg-[#1E293B]",
	},
	{
		to: "/discounts",
		label: "Discounts",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24px"
				height="24px"
				fill="currentColor"
				viewBox="0 0 256 256"
			>
				<path d="M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z"></path>
			</svg>
		),
		match: (pathname: string) => pathname.startsWith("/discounts"),
		gradient: "bg-[#1E293B]",
	},
	{
		to: "/analytics",
		label: "Analytics",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24px"
				height="24px"
				fill="currentColor"
				viewBox="0 0 256 256"
			>
				<path d="M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16ZM160,48h40V200H160ZM104,96h40V200H104ZM56,144H88v56H56Z"></path>
			</svg>
		),
		match: (pathname: string) => pathname.startsWith("/analytics"),
		gradient: "bg-[#1E293B]",
	},
];

const Sidebar: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [isCollapsed, setIsCollapsed] = useState(() => {
		const stored = localStorage.getItem("sidebar-collapsed");
		return stored === "true";
	});
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);
	const [isOnline, setIsOnline] = useState<boolean>(true);

	useEffect(() => {
		localStorage.setItem("sidebar-collapsed", isCollapsed ? "true" : "false");
	}, [isCollapsed]);

	useEffect(() => {
		const checkStatus = async () => {
			const token = localStorage.getItem("token");
			try {
				const res = await fetch("http://localhost:5000/api/auth/me", {
					headers: { Authorization: `Bearer ${token}` },
				});
				setIsOnline(res.ok);
			} catch {
				setIsOnline(false);
			}
		};
		checkStatus();
		const interval = setInterval(checkStatus, 10000); // check every 10s
		return () => clearInterval(interval);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/login", { replace: true });
	};

	return (
		<aside
			className={`layout-content-container flex flex-col transition-all duration-300 ease-in-out h-screen ${isCollapsed ? "w-16" : "w-16 md:w-72 lg:w-80"} min-w-0`}

		>
			<div className="flex flex-col p-2 md:p-4 flex-grow h-full overflow-hidden">
				{/* Header with toggle */}
				<div className="flex flex-col gap-2 md:gap-4">
					<div className="flex items-center justify-between mb-2">
						{/* Logo and Admin label */}
						<div
							className={`hidden md:flex items-center gap-2 transition-all duration-300 ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
								}`}
							style={{
								transitionProperty: "opacity, width",
							}}
						>
							{/* Admin shield icon */}
							<div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-tr from-[#334155] to-[#64748b]">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									fill="currentColor"
									viewBox="0 0 24 24"
									className="text-white"
								>
									<path d="M12 2c-.26 0-.52.07-.74.21l-7 4.2A1.75 1.75 0 0 0 3 7.7v4.77c0 5.05 3.73 9.86 8.28 10.5.15.02.29.03.44.03s.29-.01.44-.03C17.27 22.33 21 17.52 21 12.47V7.7c0-.62-.33-1.2-.87-1.49l-7-4.2A1.75 1.75 0 0 0 12 2zm0 2.15l7 4.2v4.12c0 4.22-3.13 8.36-7 8.98-3.87-.62-7-4.76-7-8.98V8.35l7-4.2zm0 3.35a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm0 2a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1zm0 3c-2.33 0-7 1.17-7 3.5V17h14v-2.5c0-2.33-4.67-3.5-7-3.5zm-5 4c.08-.32 2.38-1.5 5-1.5s4.92 1.18 5 1.5v.5H7v-.5z" />
								</svg>
							</div>
							<span className="text-white font-semibold text-lg">
								Admin
							</span>
						</div>
						<button
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700/30 text-white transition-colors"
							aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								viewBox="0 0 256 256"
								className={`transform transition-transform ${isCollapsed ? "rotate-180" : ""
									}`}
							>
								<path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
							</svg>
						</button>
					</div>
					<div className="flex flex-col flex-grow overflow-auto">

						{/* Navigation Links */}
						<nav
							className="flex flex-col gap-1 md:gap-2"
							role="navigation"
							aria-label="Main navigation"
						>
							{sidebarLinks.map((item) => {
								const isActive = item.match(location.pathname);
								const isHovered = hoveredItem === item.to;

								// Base link styles
								const baseLinkClasses = [
									"group relative flex items-center px-3 py-3 rounded-xl transition-all duration-200",
									isCollapsed ? "justify-center" : "",
									isActive
										? `bg-gradient-to-r ${item.gradient} shadow-sm border-l-4 border-white/20`
										: !isCollapsed
											? "hover:bg-slate-700/20 hover:shadow-sm"
											: "",
								].join(" ");

								// Icon styles
								const iconClasses = [
									"flex items-center justify-center w-6 h-6 transition-colors duration-200",
									isActive ? "text-white" : "text-slate-300 group-hover:text-white",
								].join(" ");

								// Label styles
								const labelClasses = [
									"hidden md:inline-block text-lg font-semibold leading-normal transition-all duration-300",
									isCollapsed
										? "opacity-0 max-w-0 ml-0"
										: "opacity-100 max-w-[200px] ml-3",
									isActive ? "text-white" : "text-slate-300 group-hover:text-white",
									"overflow-hidden whitespace-nowrap",
								].join(" ");

								return (
									<div
										key={item.to}
										className="relative"
										onMouseEnter={() => setHoveredItem(item.to)}
										onMouseLeave={() => setHoveredItem(null)}
									>
										<Link to={item.to} aria-label={item.label} className={baseLinkClasses}>
											{/* Icon */}
											<span className={iconClasses}>{item.icon}</span>

											{/* Label */}
											<span className={labelClasses}>{item.label}</span>

											{/* Active indicator */}
											{isActive && !isCollapsed && (
												<div className="hidden md:block ml-auto">
													<div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
												</div>
											)}
										</Link>

										{/* Tooltip when collapsed */}
										{isCollapsed && isHovered && (
											<div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded-md text-sm whitespace-nowrap z-50 opacity-95 shadow-lg border border-gray-700">
												{item.label}
												<div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
											</div>
										)}
									</div>
								);
							})}
						</nav>


					</div>

					{/* Footer */}
					<div className="flex flex-col gap-2 pt-3 mt-auto">
						<div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
						<div
							className={`md:flex items-center gap-2 px-3 py-2 text-slate-400 text-sm transition-all duration-300 ${isCollapsed
								? "justify-center opacity-100 w-full"
								: "hidden md:flex opacity-100 w-auto"
								}`}
							style={{
								transitionProperty: "opacity, width",
							}}
						>
							<div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
							{!isCollapsed && <span>{isOnline ? "System Online" : "System Offline"}</span>}
						</div>
						{/* Logout Button */}
						<button
							onClick={handleLogout}
							className={`flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/20 transition-all duration-200 ${isCollapsed ? "justify-center w-full" : "w-full"
								}`}
							aria-label="Logout"
						>
							<span className="flex items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									fill="currentColor"
									viewBox="0 0 24 24"
									className="text-red-400"
								>
									<path d="M12 2a1 1 0 0 1 1 1v10a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7.07-9.07a1 1 0 0 1 1.41 1.41A9 9 0 1 1 4.93 10.34a1 1 0 1 1 1.41-1.41A7 7 0 1 0 19.07 8.93z" />
								</svg>
							</span>
							{!isCollapsed && <span className="text-red-400 font-medium">Logout</span>}
						</button>

						{/* Copyright */}
						{!isCollapsed && (
							<div className="text-xs text-slate-500 text-center mt-2">
								© Malek {new Date().getFullYear()}
							</div>
						)}
					</div>
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;