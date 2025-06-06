import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

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
		gradient: "bg-gradient-to-tl from-[#15803d] via-[#115e59] to-[#164e63]",
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
		gradient: "bg-gradient-to-r from-[#d1d5db] via-[#6b7280] to-[#374151]",
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
				viewBox="0 0 256 256"
			>
				<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z"></path>
			</svg>
		),
		match: (pathname: string) => pathname.startsWith("/products"),
		gradient: "bg-gradient-to-br from-[#f59e0b] via-[#ea580c] to-[#b91c1c]",
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
				<path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
			</svg>
		),
		match: (pathname: string) => pathname.startsWith("/customers"),
		gradient: "bg-gradient-to-t from-[#4c0033] via-[#790252] to-[#af0171]",
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
		gradient: "bg-gradient-to-tl from-[#ffcc1d] via-[#0b4619] to-[#116530]",
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
		gradient: "from-cyan-500 to-blue-600",
	},
];

const Sidebar: React.FC = () => {
	const location = useLocation();
	const [isCollapsed, setIsCollapsed] = useState(() => {
		const stored = localStorage.getItem("sidebar-collapsed");
		return stored === "true";
	});
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);

	useEffect(() => {
		localStorage.setItem("sidebar-collapsed", isCollapsed ? "true" : "false");
	}, [isCollapsed]);

	return (
		<aside
			className={`layout-content-container flex flex-col transition-all duration-300 ease-in-out ${
				isCollapsed ? "w-16" : "w-16 md:w-72 lg:w-80"
			} min-w-0`}
		>
			<div className="flex h-full min-h-[500px] md:min-h-[700px] flex-col justify-between p-2 md:p-4">
				{/* Header with toggle */}
				<div className="flex flex-col gap-2 md:gap-4">
					<div className="flex items-center justify-between mb-2">
						{/* Logo and Admin label */}
						<div
							className={`hidden md:flex items-center gap-2 transition-all duration-300 ${
								isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
							}`}
							style={{
								transitionProperty: "opacity, width",
							}}
						>
                            {/* bg-gradient-to-r from-blue-500 to-purple-600 */}
							<div className="w-8 h-8 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">A</span>
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
								className={`transform transition-transform ${
									isCollapsed ? "rotate-180" : ""
								}`}
							>
								<path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
							</svg>
						</button>
					</div>

					{/* Navigation Links */}
					<nav
						className="flex flex-col gap-1 md:gap-2"
						role="navigation"
						aria-label="Main navigation"
					>
						{sidebarLinks.map((item) => {
							const isActive = item.match(location.pathname);
							return (
								<div
									key={item.to}
									className="relative"
									onMouseEnter={() => setHoveredItem(item.to)}
									onMouseLeave={() => setHoveredItem(null)}
								>
									<Link
										to={item.to}
										className={`group relative flex items-center px-0 md:px-3 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
											isCollapsed ? "justify-center" : ""
										} ${
											isActive
												? `bg-gradient-to-r ${item.gradient} shadow-lg border-l-4 border-white/20`
												: !isCollapsed
													? "hover:bg-slate-700/20 hover:shadow-md"
													: ""
										}`}
										aria-label={item.label}
										style={{
											background: isActive || (!isCollapsed && !isActive) ? undefined : "none",
											boxShadow: isActive ? undefined : "none",
										}}
									>
										{/* Icon box */}
										<div
											className={`flex items-center justify-center w-10 ${
												isCollapsed ? "h-10" : "h-10"
											} rounded-lg transition-all duration-200 ${
												isActive && !isCollapsed
													? "bg-white/10"
													: "bg-transparent"
											} ${isCollapsed ? "mx-auto ml-2.5" : ""}`}
										>
											<span
												className={`relative z-10 flex items-center justify-center w-6 h-6 transition-colors duration-200 ${
													isActive
														? "text-white"
														: "text-slate-300 group-hover:text-white"
												}`}
											>
												{item.icon}
											</span>
										</div>
										{/* Label with fade/slide animation */}
										<span
											className={`hidden md:inline-block ml-3 text-lg font-medium leading-normal transition-all duration-300
                        ${
							isCollapsed
								? "opacity-0 w-0 ml-0"
								: "opacity-100 w-auto ml-3"
						}
                        ${
							isActive
								? "text-white"
								: "text-slate-300 group-hover:text-white"
						}`}
											style={{
												maxWidth: isCollapsed ? 0 : "200px",
												overflow: "hidden",
												whiteSpace: "nowrap",
												transitionProperty:
													"opacity, max-width, margin-left",
											}}
										>
											{item.label}
										</span>
										{/* Subtle animation indicator */}
										{isActive && !isCollapsed && (
											<div className="hidden md:block ml-auto">
												<div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
											</div>
										)}
										{/* Glow effect for active item */}
										{isActive && (
											<div
												className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.gradient} opacity-20 blur-sm pointer-events-none`}
											></div>
										)}
									</Link>
									{/* Tooltip for collapsed state */}
									{isCollapsed && hoveredItem === item.to && (
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
				<div className="flex flex-col gap-2">
					<div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
					<div
						className={`md:flex items-center gap-2 px-3 py-2 text-slate-400 text-sm transition-all duration-300 ${
							isCollapsed
								? "justify-center opacity-100 w-full"
								: "hidden md:flex opacity-100 w-auto"
						}`}
						style={{
							transitionProperty: "opacity, width",
						}}
					>
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
						{!isCollapsed && <span>System Online</span>}
					</div>
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;