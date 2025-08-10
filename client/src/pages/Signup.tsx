import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	// Track if each field has been touched
	const [dirtyUsername, setDirtyUsername] = useState(false);
	const [dirtyEmail, setDirtyEmail] = useState(false);
	const [dirtyPassword, setDirtyPassword] = useState(false);
	const [dirtyConfirm, setDirtyConfirm] = useState(false);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const navigate = useNavigate();

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	// password rule checks (displayed live)
	const pwdRules = {
		length: password.length >= 8,
		lower: /[a-z]/.test(password),
		upper: /[A-Z]/.test(password),
		number: /\d/.test(password),
		special: /[@$!%*?&]/.test(password),
	};
	const passwordValid = Object.values(pwdRules).every(Boolean);

	const usernameValid = username.trim().length >= 3;
	const emailValid = email.length > 0 ? emailRegex.test(email) : false;
	const confirmMatches = confirmPassword.length > 0 ? password === confirmPassword : false;

	// overall form validity
	const allValid = emailValid && usernameValid && passwordValid && confirmMatches;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		if (loading) return;

		if (!allValid) {
			setError("Please fix validation errors before submitting.");
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("http://localhost:5000/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, username, password }),
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.message || "Signup failed. Please try again.");
			} else {
				setSuccess("Signup successful! Redirecting to login...");
				setTimeout(() => navigate("/login"), 1200);
			}
		} catch (err: unknown) {
			console.error("Signup error:", err);
			setError("Network error. Please check your connection.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-[#111422]">
			<div className="bg-[#1e293b] border border-[#334155] rounded-xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-6">
				{/* header */}
				<div className="flex flex-col items-center gap-2">
					<div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-tr from-[#334155] to-[#64748b] mb-2 shadow">
						{/* svg left unchanged */}
						<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24" className="text-white">
							<path d="M12 2c-.26 0-.52.07-.74.21l-7 4.2A1.75 1.75 0 0 0 3 7.7v4.77c0 5.05 3.73 9.86 8.28 10.5.15.02.29.03.44.03s.29-.01.44-.03C17.27 22.33 21 17.52 21 12.47V7.7c0-.62-.33-1.2-.87-1.49l-7-4.2A1.75 1.75 0 0 0 12 2zm0 2.15l7 4.2v4.12c0 4.22-3.13 8.36-7 8.98-3.87-.62-7-4.76-7-8.98V8.35l7-4.2zm0 3.35a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm0 2a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1zm0 3c-2.33 0-7 1.17-7 3.5V17h14v-2.5c0-2.33-4.67-3.5-7-3.5zm-5 4c.08-.32 2.38-1.5 5-1.5s4.92 1.18 5 1.5v.5H7v-.5z" />
						</svg>
					</div>
					<h2 className="text-white text-2xl font-bold">Sign Up</h2>
					<p className="text-slate-400 text-sm">Create your admin account</p>
				</div>

				{/* form */}
				<form className="flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="off">
					{/* username */}
					<div>
						<label className="block text-slate-300 mb-1" htmlFor="username">Username</label>
						<input
							id="username"
							type="text"
							autoComplete="username"
							className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#64748b]"
							placeholder="yourusername"
							value={username}
							onChange={(e) => {
								setUsername(e.target.value);
								if (!dirtyUsername) setDirtyUsername(true);
							}}

							required
						/>
						<div className="mt-1 text-xs">
							{dirtyUsername && (
								usernameValid ? (
									<span className="text-green-400">Looks good</span>
								) : (
									<span className="text-red-400">Minimum 3 characters</span>
								)
							)}

						</div>
					</div>

					{/* email */}
					<div>
						<label className="block text-slate-300 mb-1" htmlFor="email">Email</label>
						<input
							id="email"
							type="email"
							autoComplete="email"
							className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#64748b]"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								if (!dirtyEmail) setDirtyEmail(true);
							}}

							required
						/>
						<div className="mt-1 text-xs">
							{email.length > 0 ? (
								emailValid ? (
									<span className="text-green-400">Valid email</span>
								) : (
									<span className="text-red-400">Invalid email format</span>
								)
							) : null}
						</div>
					</div>

					{/* password */}
					<div>
						<label className="block text-slate-300 mb-1" htmlFor="password">Password</label>
						<div className="relative">
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								autoComplete="new-password"
								className="w-full px-4 py-2 pr-10 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#64748b]"
								placeholder="••••••••"
								value={password}
								onChange={(e) => {
									setPassword(e.target.value);
									if (!dirtyPassword) setDirtyPassword(true);
								}}

								required
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? "🙈" : "👁️"}
							</button>
						</div>

						{/* live password rule hints */}
						{ password.length > 0 && dirtyPassword && (
						<ul className="mt-2 text-xs space-y-1">
							<li className={pwdRules.length ? "text-green-400" : "text-red-400"}>
								{pwdRules.length ? "✔" : "✖"} At least 8 characters
							</li>
							<li className={pwdRules.lower ? "text-green-400" : "text-red-400"}>
								{pwdRules.lower ? "✔" : "✖"} Contains a lowercase letter
							</li>
							<li className={pwdRules.upper ? "text-green-400" : "text-red-400"}>
								{pwdRules.upper ? "✔" : "✖"} Contains an uppercase letter
							</li>
							<li className={pwdRules.number ? "text-green-400" : "text-red-400"}>
								{pwdRules.number ? "✔" : "✖"} Contains a number
							</li>
							<li className={pwdRules.special ? "text-green-400" : "text-red-400"}>
								{pwdRules.special ? "✔" : "✖"} Contains a special character (@$!%*?&)
							</li>
						</ul>
						)}
					</div>

					{/* confirm password */}
					<div>
						<label className="block text-slate-300 mb-1" htmlFor="confirmPassword">Confirm Password</label>
						<div className="relative">
							<input
								id="confirmPassword"
								type={showConfirm ? "text" : "password"}
								autoComplete="off"
								className={`w-full px-4 py-2 pr-10 rounded-lg bg-slate-800 text-white border ${confirmMatches || confirmPassword === "" ? "border-slate-700" : "border-red-500"} focus:outline-none focus:ring-2 focus:ring-[#64748b]`}
								placeholder="••••••••"
								value={confirmPassword}
								onChange={(e) => {
									setConfirmPassword(e.target.value);
									if (!dirtyConfirm) setDirtyConfirm(true);
								}}

								required
							/>
							<button
								type="button"
								onClick={() => setShowConfirm(!showConfirm)}
								className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
								aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
							>
								{showConfirm ? "🙈" : "👁️"}
							</button>
						</div>
						<div className="mt-1 text-xs">
							{confirmPassword.length > 0 ? (
								confirmMatches ? (
									<span className="text-green-400">Passwords match</span>
								) : (
									<span className="text-red-400">Passwords do not match</span>
								)
							) : null}
						</div>
					</div>

					{/* errors / success */}
					{error && <div className="text-red-400 text-sm text-center">{error}</div>}
					{success && <div className="text-green-400 text-sm text-center">{success}</div>}

					{/* submit */}
					<button
						type="submit"
						disabled={!allValid || loading}
						aria-disabled={!allValid || loading}
						className={`w-full py-2 rounded-lg text-white font-semibold shadow-md transition-all flex items-center justify-center gap-2 ${allValid ? "bg-gradient-to-r from-[#334155] via-[#64748b] to-[#94a3b8] hover:brightness-110" : "bg-slate-700 opacity-60 cursor-not-allowed"
							}`}
					>
						{loading ? "Signing up..." : "Sign Up"}
					</button>
				</form>

				<div className="text-center text-slate-400 text-sm mt-2">
					Already have an account?{" "}
					<span className="text-blue-400 hover:underline cursor-pointer" onClick={() => navigate("/login")}>Sign in</span>
				</div>
			</div>
		</div>
	);
};

export default Signup;
