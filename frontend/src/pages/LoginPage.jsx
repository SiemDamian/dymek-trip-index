import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	TextField,
	Typography,
	InputAdornment,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
	const { login } = useAuth();
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		if (!username.trim() || !password.trim()) {
			setError("Podaj login i hasło.");
			return;
		}

		try {
			setLoading(true);
			setError("");

			await login(username, password);
			navigate("/");
		} catch {
			setError("Błędne dane logowania.");
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			handleLogin();
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				p: 2,
				position: "relative",
				overflow: "hidden",
				color: "#fff",
				background:
					"radial-gradient(circle at top left, rgba(124,58,237,.48), transparent 32%), radial-gradient(circle at top right, rgba(14,165,233,.36), transparent 30%), radial-gradient(circle at bottom, rgba(244,63,94,.28), transparent 36%), linear-gradient(135deg, #050816 0%, #0f172a 48%, #111827 100%)",
				"&::before": {
					content: '""',
					position: "absolute",
					inset: 0,
					backgroundImage:
						"linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)",
					backgroundSize: "42px 42px",
					maskImage:
						"linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,.15))",
					pointerEvents: "none",
				},
			}}
		>
			<FloatingOrb
				sx={{
					width: 280,
					height: 280,
					top: 80,
					right: -80,
					background: "rgba(59,130,246,.35)",
				}}
			/>

			<FloatingOrb
				sx={{
					width: 240,
					height: 240,
					bottom: 70,
					left: -80,
					background: "rgba(236,72,153,.28)",
				}}
			/>

			<Card
				sx={{
					width: "100%",
					maxWidth: 430,
					position: "relative",
					zIndex: 2,
					borderRadius: 7,
					color: "#fff",
					overflow: "hidden",
					background:
						"linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.05))",
					border: "1px solid rgba(255,255,255,.16)",
					boxShadow:
						"0 40px 120px rgba(0,0,0,.45), 0 0 90px rgba(124,58,237,.18)",
					backdropFilter: "blur(24px)",
					"&::before": {
						content: '""',
						position: "absolute",
						inset: 0,
						background:
							"radial-gradient(circle at top right, rgba(34,211,238,.18), transparent 38%), radial-gradient(circle at bottom left, rgba(168,85,247,.18), transparent 42%)",
						pointerEvents: "none",
					},
				}}
			>
				<CardContent
					sx={{
						p: { xs: 3, sm: 4 },
						position: "relative",
						zIndex: 1,
					}}
				>
					<Box sx={{ textAlign: "center", mb: 4 }}>
						<Chip
							label="TRIP INDEX ACCESS"
							sx={{
								mb: 2,
								color: "#fff",
								fontWeight: 900,
								letterSpacing: ".12em",
								background:
									"linear-gradient(135deg, rgba(34,211,238,.28), rgba(168,85,247,.35))",
								border: "1px solid rgba(255,255,255,.16)",
							}}
						/>

						<Box
							sx={{
								width: 82,
								height: 82,
								mx: "auto",
								mb: 2,
								borderRadius: 6,
								display: "grid",
								placeItems: "center",
								fontSize: 42,
								background:
									"linear-gradient(135deg, rgba(34,211,238,.95), rgba(168,85,247,.95), rgba(244,63,94,.95))",
								boxShadow:
									"0 20px 60px rgba(124,58,237,.38), inset 0 1px 0 rgba(255,255,255,.35)",
							}}
						>
							🧭
						</Box>

						<Typography
							variant="h3"
							fontWeight={950}
							sx={{
								letterSpacing: "-.06em",
								background:
									"linear-gradient(90deg, #fff, #bae6fd, #ddd6fe, #fecdd3)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								lineHeight: 1,
							}}
						>
							Zaloguj się
						</Typography>

						<Typography
							sx={{
								mt: 1.5,
								color: "rgba(255,255,255,.62)",
							}}
						>
							Wejdź do centrum dowodzenia wyjazdami.
						</Typography>
					</Box>

					<Box display="flex" flexDirection="column" gap={2.2}>
						<TextField
							label="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							onKeyDown={handleKeyDown}
							fullWidth
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Box
											component="span"
											sx={{
												color: "rgba(255,255,255,.7)",
											}}
										>
											👤
										</Box>
									</InputAdornment>
								),
							}}
							sx={inputSx}
						/>

						<TextField
							label="Password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							onKeyDown={handleKeyDown}
							fullWidth
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Box
											component="span"
											sx={{
												color: "rgba(255,255,255,.7)",
											}}
										>
											🔒
										</Box>
									</InputAdornment>
								),
							}}
							sx={inputSx}
						/>

						<Button
							variant="contained"
							onClick={handleLogin}
							disabled={loading}
							sx={{
								mt: 1,
								py: 1.45,
								borderRadius: 999,
								fontWeight: 950,
								fontSize: 16,
								textTransform: "none",
								color: "#fff",
								background:
									"linear-gradient(135deg, #06b6d4, #7c3aed, #ec4899)",
								boxShadow:
									"0 20px 55px rgba(124,58,237,.35), 0 0 35px rgba(34,211,238,.18)",
								transition: ".25s ease",
								"&:hover": {
									transform: "translateY(-3px)",
									boxShadow:
										"0 26px 70px rgba(124,58,237,.48), 0 0 45px rgba(34,211,238,.28)",
									background:
										"linear-gradient(135deg, #22d3ee, #8b5cf6, #f472b6)",
								},
								"&.Mui-disabled": {
									color: "rgba(255,255,255,.55)",
									background: "rgba(255,255,255,.12)",
								},
							}}
						>
							{loading ? "Logowanie..." : "Zaloguj"}
						</Button>

						{error && (
							<Box
								sx={{
									mt: 1,
									p: 1.5,
									borderRadius: 4,
									textAlign: "center",
									background: "rgba(127,29,29,.45)",
									border: "1px solid rgba(248,113,113,.35)",
								}}
							>
								<Typography color="#fecaca" fontWeight={700}>
									{error}
								</Typography>
							</Box>
						)}
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
}

const inputSx = {
	"& .MuiOutlinedInput-root": {
		borderRadius: 4,
		color: "#fff",
		background: "rgba(15,23,42,.52)",
		border: "1px solid rgba(255,255,255,.12)",
		transition: ".25s ease",
		"& fieldset": {
			borderColor: "rgba(255,255,255,.14)",
		},
		"&:hover fieldset": {
			borderColor: "rgba(125,211,252,.55)",
		},
		"&.Mui-focused": {
			background: "rgba(15,23,42,.72)",
			boxShadow: "0 0 35px rgba(34,211,238,.14)",
		},
		"&.Mui-focused fieldset": {
			borderColor: "#38bdf8",
		},
	},
	"& .MuiInputLabel-root": {
		color: "rgba(255,255,255,.55)",
	},
	"& .MuiInputLabel-root.Mui-focused": {
		color: "#7dd3fc",
	},
	"& input:-webkit-autofill": {
		WebkitBoxShadow: "0 0 0 100px #0f172a inset",
		WebkitTextFillColor: "#fff",
		caretColor: "#fff",
		borderRadius: "inherit",
	},
};

function FloatingOrb({ sx }) {
	return (
		<Box
			sx={{
				position: "absolute",
				borderRadius: "50%",
				filter: "blur(35px)",
				opacity: 0.85,
				animation: "float 8s ease-in-out infinite",
				"@keyframes float": {
					"0%, 100%": {
						transform: "translateY(0px) scale(1)",
					},
					"50%": {
						transform: "translateY(-24px) scale(1.08)",
					},
				},
				...sx,
			}}
		/>
	);
}
