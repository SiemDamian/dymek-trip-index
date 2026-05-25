import { useEffect, useMemo, useState } from "react";
import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	LinearProgress,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
	const { user, logout } = useAuth();

	const [trips, setTrips] = useState([]);
	const [ranking, setRanking] = useState([]);
	const [badges, setBadges] = useState([]);
	const [error, setError] = useState("");

	const [selectedBadge, setSelectedBadge] = useState(null);
	const [selectedTrip, setSelectedTrip] = useState(null);
	const [selectedRank, setSelectedRank] = useState(null);

	useEffect(() => {
		loadDashboardData();
	}, []);

	const loadDashboardData = async () => {
		try {
			const [tripsRes, rankingRes, badgesRes] = await Promise.all([
				api.get("trips/"),
				api.get("rankings/"),
				api.get("badges/me/"),
			]);

			setTrips(tripsRes.data);
			setRanking(rankingRes.data);
			setBadges(badgesRes.data);
		} catch (err) {
			console.error(err);
			setError("Nie udało się pobrać danych dashboardu.");
		}
	};

	const stats = user?.stats;

	const currentTrip = useMemo(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return (
			trips.find((trip) => {
				const start = new Date(trip.start_date);
				const end = new Date(trip.end_date);

				start.setHours(0, 0, 0, 0);
				end.setHours(0, 0, 0, 0);

				return (
					trip.status === "planned" && start <= today && end >= today
				);
			}) || null
		);
	}, [trips]);

	const plannedTrip = useMemo(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const planned = trips
			.filter((trip) => {
				const start = new Date(trip.start_date);
				start.setHours(0, 0, 0, 0);

				return trip.status === "planned" && start > today;
			})
			.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

		return planned[0] || null;
	}, [trips]);

	const lastFinishedTrip = useMemo(() => {
		const finished = trips
			.filter((trip) => trip.status === "finished")
			.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));

		return finished[0] || null;
	}, [trips]);

	const plannedTrips = useMemo(() => {
		return trips
			.filter((trip) => trip.status === "planned")
			.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
	}, [trips]);

	const finishedTrips = useMemo(() => {
		return trips
			.filter((trip) => trip.status === "finished")
			.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
	}, [trips]);

	const myTrips = useMemo(() => {
		if (!user?.id) return [];

		return finishedTrips.filter((trip) => isUserPresentOnTrip(trip, user));
	}, [finishedTrips, user]);

	const otherTrips = useMemo(() => {
		if (!user?.id) return finishedTrips;

		return finishedTrips.filter((trip) => !isUserPresentOnTrip(trip, user));
	}, [finishedTrips, user]);

	const tripInfo = currentTrip
		? getCurrentTripText(currentTrip)
		: plannedTrip
			? getCountdownText(plannedTrip)
			: null;

	const lastTripInfo = lastFinishedTrip
		? getLastTripText(lastFinishedTrip)
		: null;

	const rankProgress = Math.min(Number(stats?.attendance_percent ?? 0), 100);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				p: { xs: 2, md: 4 },
				color: "#fff",
				position: "relative",
				overflow: "hidden",
				background:
					"radial-gradient(circle at top left, rgba(124,58,237,.45), transparent 32%), radial-gradient(circle at top right, rgba(14,165,233,.35), transparent 30%), radial-gradient(circle at bottom, rgba(244,63,94,.28), transparent 35%), linear-gradient(135deg, #050816 0%, #0f172a 45%, #111827 100%)",
				"&::before": {
					content: '""',
					position: "absolute",
					inset: 0,
					backgroundImage:
						"linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)",
					backgroundSize: "42px 42px",
					maskImage:
						"linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,.2))",
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
					width: 220,
					height: 220,
					bottom: 120,
					left: -70,
					background: "rgba(236,72,153,.25)",
				}}
			/>

			<Box sx={{ position: "relative", zIndex: 2 }}>
				<HeroSection user={user} logout={logout} stats={stats} />

				{error && (
					<Box
						sx={{
							mb: 3,
							p: 2,
							borderRadius: 4,
							border: "1px solid rgba(248,113,113,.45)",
							background: "rgba(127,29,29,.45)",
							backdropFilter: "blur(16px)",
						}}
					>
						<Typography color="#fecaca">{error}</Typography>
					</Box>
				)}

				<Grid container spacing={3} sx={{ mb: 4 }}>
					{tripInfo && (
						<Grid item xs={12} md={6}>
							<HighlightCard
								eyebrow="Akcja teraz"
								title={tripInfo.title}
								description={tripInfo.description}
								icon="🚀"
								accent="linear-gradient(135deg, #22c55e, #14b8a6)"
							/>
						</Grid>
					)}

					{lastTripInfo && (
						<Grid item xs={12} md={6}>
							<HighlightCard
								eyebrow="Historia chwały"
								title={lastTripInfo.title}
								description={lastTripInfo.description}
								icon="🏔️"
								accent="linear-gradient(135deg, #f97316, #ec4899)"
							/>
						</Grid>
					)}
				</Grid>

				<Grid container spacing={2.5} sx={{ mb: 4 }}>
					<Grid item xs={12} sm={6} md={3}>
						<StatCard
							title="Trip Index"
							value={stats?.total_score ?? 0}
							suffix="pkt"
							icon="⚡"
							glow="#a78bfa"
						/>
					</Grid>

					<Grid item xs={12} sm={6} md={3}>
						<Box
							onClick={() =>
								setSelectedRank({
									name: stats?.current_rank || "Brak",
									description:
										stats?.current_rank_description ||
										"Brak opisu rangi.",
									score: stats?.total_score ?? 0,
								})
							}
							sx={{ cursor: "pointer" }}
						>
							<StatCard
								title="Ranga"
								value={stats?.current_rank || "Brak"}
								icon="👑"
								glow="#facc15"
								clickable
							/>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6} md={3}>
						<StatCard
							title="Wyjazdy"
							value={stats?.total_trips ?? 0}
							icon="🧭"
							glow="#38bdf8"
						/>
					</Grid>

					<Grid item xs={12} sm={6} md={3}>
						<StatCard
							title="Frekwencja"
							value={stats?.attendance_percent ?? 0}
							suffix="%"
							icon="🎯"
							glow="#34d399"
						/>
					</Grid>

					<Grid item xs={12} sm={6} md={3}>
						<StatCard
							title="Aktualny streak"
							value={stats?.current_streak ?? 0}
							icon="🔥"
							glow="#fb7185"
						/>
					</Grid>

					<Grid item xs={12} sm={6} md={3}>
						<StatCard
							title="Najdłuższy streak"
							value={stats?.longest_streak ?? 0}
							icon="💎"
							glow="#22d3ee"
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<GlassCard>
							<Stack spacing={1.5}>
								<Stack
									direction="row"
									alignItems="center"
									justifyContent="space-between"
								>
									<Box>
										<Typography
											color="rgba(255,255,255,.65)"
											variant="body2"
										>
											Puls aktywności
										</Typography>

										<Typography
											variant="h5"
											fontWeight={900}
										>
											{rankProgress}% frekwencji
										</Typography>
									</Box>

									<Box
										sx={{
											width: 54,
											height: 54,
											borderRadius: "50%",
											display: "grid",
											placeItems: "center",
											background:
												"linear-gradient(135deg, rgba(34,211,238,.95), rgba(168,85,247,.95))",
											boxShadow:
												"0 0 35px rgba(34,211,238,.35)",
											fontSize: 28,
										}}
									>
										📈
									</Box>
								</Stack>

								<LinearProgress
									variant="determinate"
									value={rankProgress}
									sx={{
										height: 12,
										borderRadius: 999,
										backgroundColor: "rgba(255,255,255,.1)",
										"& .MuiLinearProgress-bar": {
											borderRadius: 999,
											background:
												"linear-gradient(90deg, #22c55e, #22d3ee, #a855f7)",
										},
									}}
								/>

								<Typography
									color="rgba(255,255,255,.6)"
									variant="body2"
								>
									Im wyższa frekwencja, tym mocniejsza pozycja
									w społeczności.
								</Typography>
							</Stack>
						</GlassCard>
					</Grid>
				</Grid>

				<Grid container spacing={3}>
					<Grid item xs={12} md={7}>
						<GlassCard>
							<SectionHeader
								kicker="Tablica dominacji"
								title="Ranking"
								icon="🏆"
							/>

							<TableContainer
								sx={{
									width: "100%",
									overflowX: "auto",
									overflowY: "hidden",
									borderRadius: 4,
									"&::-webkit-scrollbar": {
										height: 8,
									},
									"&::-webkit-scrollbar-track": {
										background: "rgba(255,255,255,.06)",
										borderRadius: 999,
									},
									"&::-webkit-scrollbar-thumb": {
										background:
											"linear-gradient(90deg, #22d3ee, #8b5cf6)",
										borderRadius: 999,
									},
								}}
							>
								<Table
									size="small"
									sx={{
										minWidth: 760,
										"& .MuiTableCell-root": {
											borderColor:
												"rgba(255,255,255,.08)",
											color: "#fff",
											whiteSpace: "nowrap",
										},
										"& .MuiTableHead-root .MuiTableCell-root":
											{
												color: "rgba(255,255,255,.55)",
												fontWeight: 800,
												textTransform: "uppercase",
												letterSpacing: ".08em",
												fontSize: 12,
											},
									}}
								>
									<TableHead>
										<TableRow>
											<TableCell>#</TableCell>
											<TableCell>Użytkownik</TableCell>
											<TableCell>Wynik</TableCell>
											<TableCell>Ranga</TableCell>
											<TableCell>Streak</TableCell>
											<TableCell>Frekwencja</TableCell>
										</TableRow>
									</TableHead>

									<TableBody>
										{ranking.map((row, index) => (
											<TableRow
												key={row.id}
												sx={{
													transition: ".25s ease",
													"&:hover": {
														background:
															"rgba(255,255,255,.07)",
													},
												}}
											>
												<TableCell>
													<RankBadge index={index} />
												</TableCell>

												<TableCell>
													<Stack
														direction="row"
														spacing={1.5}
														alignItems="center"
													>
														<Avatar
															sx={{
																width: 34,
																height: 34,
																fontWeight: 900,
																background:
																	index === 0
																		? "linear-gradient(135deg, #facc15, #f97316)"
																		: "linear-gradient(135deg, #334155, #64748b)",
																boxShadow:
																	index === 0
																		? "0 0 25px rgba(250,204,21,.35)"
																		: "none",
															}}
														>
															{
																(row.display_name ||
																	row.username)?.[0]
															}
														</Avatar>

														<Typography
															fontWeight={800}
														>
															{row.display_name ||
																row.username}
														</Typography>
													</Stack>
												</TableCell>

												<TableCell>
													<Typography
														fontWeight={900}
													>
														{row.total_score}
													</Typography>
												</TableCell>

												<TableCell>
													<Chip
														label={
															row.rank_name || "-"
														}
														size="small"
														sx={{
															color: "#fff",
															fontWeight: 800,
															maxWidth: 180,
															background:
																"linear-gradient(135deg, rgba(168,85,247,.85), rgba(59,130,246,.85))",
															"& .MuiChip-label":
																{
																	overflow:
																		"hidden",
																	textOverflow:
																		"ellipsis",
																},
														}}
													/>
												</TableCell>

												<TableCell>
													{row.current_streak} 🔥
												</TableCell>
												<TableCell>
													{row.attendance_percent}%
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</GlassCard>
					</Grid>

					<Grid item xs={12} md={5}>
						<GlassCard>
							<SectionHeader
								kicker="Kolekcja prestiżu"
								title="Moje odznaki"
								icon="🎖️"
							/>

							{badges.length === 0 && (
								<EmptyState
									icon="🕳️"
									title="Brak odznak"
									description="Jeszcze nic nie błyszczy, ale potencjał jest."
								/>
							)}

							<Stack
								direction="row"
								spacing={2}
								flexWrap="wrap"
								useFlexGap
							>
								{badges.map((userBadge) => (
									<Box
										key={userBadge.id}
										onClick={() =>
											setSelectedBadge(userBadge)
										}
										sx={{
											width: 118,
											textAlign: "center",
											cursor: "pointer",
											p: 1.5,
											borderRadius: 5,
											position: "relative",
											background:
												"linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.04))",
											border: "1px solid rgba(255,255,255,.12)",
											transition: ".3s ease",
											"&:hover": {
												transform:
													"translateY(-8px) scale(1.04)",
												boxShadow:
													"0 22px 50px rgba(168,85,247,.25)",
												borderColor:
													"rgba(216,180,254,.55)",
											},
										}}
									>
										<Avatar
											src={
												userBadge.badge_image_url || ""
											}
											alt={userBadge.badge_name}
											sx={{
												width: 68,
												height: 68,
												mx: "auto",
												mb: 1,
												fontWeight: 900,
												fontSize: 28,
												background:
													"linear-gradient(135deg, #7c3aed, #06b6d4)",
												boxShadow:
													"0 0 30px rgba(124,58,237,.45)",
											}}
										>
											{userBadge.badge_name?.[0]}
										</Avatar>

										<Typography
											variant="body2"
											fontWeight={800}
										>
											{userBadge.badge_name}
										</Typography>
									</Box>
								))}
							</Stack>
						</GlassCard>
					</Grid>

					<Grid item xs={12}>
						<GlassCard>
							<SectionHeader
								kicker="Twoja historia wyjazdowa"
								title="Wyjazdy"
								icon="🌍"
							/>

							<TripSection
								title="Planowane wyjazdy"
								subtitle="Nadchodzące wyjazdy i Twoja deklarowana obecność."
								icon="🛫"
								trips={plannedTrips}
								user={user}
								emptyTitle="Brak planowanych wyjazdów"
								emptyDescription="Na razie nie ma żadnych przyszłych wyjazdów."
								onTripClick={setSelectedTrip}
							/>

							<Box sx={{ mt: 4 }}>
								<TripSection
									title="Wyjazdy, na których byłaś/byłeś"
									subtitle="Zakończone wyjazdy z potwierdzoną obecnością."
									icon="✅"
									trips={myTrips}
									user={user}
									emptyTitle="Brak zaliczonych wyjazdów"
									emptyDescription="Na razie nie masz zakończonych wyjazdów z potwierdzoną obecnością."
									onTripClick={setSelectedTrip}
								/>
							</Box>

							<Box sx={{ mt: 4 }}>
								<TripSection
									title="Wyjazdy, na których Cię nie było"
									subtitle="Zakończone wyjazdy bez Twojej obecności."
									icon="❌"
									trips={otherTrips}
									user={user}
									emptyTitle="Brak opuszczonych wyjazdów"
									emptyDescription="Nie masz zakończonych wyjazdów oznaczonych jako opuszczone."
									onTripClick={setSelectedTrip}
								/>
							</Box>
						</GlassCard>
					</Grid>
				</Grid>

				<BadgeDialog
					selectedBadge={selectedBadge}
					onClose={() => setSelectedBadge(null)}
				/>

				<TripDialog
					selectedTrip={selectedTrip}
					user={user}
					onClose={() => setSelectedTrip(null)}
				/>

				<RankDialog
					selectedRank={selectedRank}
					onClose={() => setSelectedRank(null)}
				/>
			</Box>
		</Box>
	);
}

function HeroSection({ user, logout, stats }) {
	return (
		<Box
			sx={{
				mb: 4,
				p: { xs: 3, md: 4 },
				borderRadius: 7,
				position: "relative",
				overflow: "hidden",
				background:
					"linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.06))",
				border: "1px solid rgba(255,255,255,.16)",
				boxShadow: "0 30px 90px rgba(0,0,0,.35)",
				backdropFilter: "blur(22px)",
				"&::after": {
					content: '""',
					position: "absolute",
					width: 360,
					height: 360,
					borderRadius: "50%",
					right: -100,
					top: -140,
					background:
						"radial-gradient(circle, rgba(34,211,238,.35), transparent 65%)",
				},
			}}
		>
			<Stack
				direction={{ xs: "column", md: "row" }}
				justifyContent="space-between"
				alignItems={{ xs: "flex-start", md: "center" }}
				spacing={3}
				sx={{ position: "relative", zIndex: 2 }}
			>
				<Box>
					<Chip
						label="TRIP INDEX COMMAND CENTER"
						sx={{
							mb: 2,
							color: "#fff",
							fontWeight: 900,
							letterSpacing: ".12em",
							background:
								"linear-gradient(135deg, rgba(34,211,238,.3), rgba(168,85,247,.35))",
							border: "1px solid rgba(255,255,255,.18)",
						}}
					/>

					<Typography
						variant="h2"
						fontWeight={950}
						sx={{
							lineHeight: 1,
							fontSize: { xs: 44, md: 72 },
							letterSpacing: "-.06em",
							background:
								"linear-gradient(90deg, #fff, #bae6fd, #ddd6fe, #fecdd3)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							textShadow: "0 0 55px rgba(125,211,252,.2)",
						}}
					>
						Trip Index
					</Typography>

					<Typography
						variant="h6"
						sx={{
							mt: 1.5,
							color: "rgba(255,255,255,.7)",
							maxWidth: 680,
						}}
					>
						Witaj,{" "}
						<Box
							component="span"
							sx={{ color: "#fff", fontWeight: 900 }}
						>
							{user?.display_name || user?.username}
						</Box>
						. Twoje wyjazdy, status, odznaki i dominacja w rankingu
						— wszystko w jednym miejscu.
					</Typography>
				</Box>

				<Stack
					spacing={2}
					alignItems={{ xs: "stretch", md: "flex-end" }}
				>
					<Box
						sx={{
							p: 2,
							minWidth: 220,
							borderRadius: 5,
							background: "rgba(15,23,42,.55)",
							border: "1px solid rgba(255,255,255,.12)",
							boxShadow: "0 20px 50px rgba(0,0,0,.28)",
						}}
					>
						<Typography
							color="rgba(255,255,255,.55)"
							variant="body2"
						>
							Aktualny status
						</Typography>

						<Typography variant="h5" fontWeight={950}>
							{stats?.current_rank || "Brak rangi"}
						</Typography>

						<Typography
							color="rgba(255,255,255,.65)"
							variant="body2"
						>
							{stats?.total_score ?? 0} pkt ·{" "}
							{stats?.total_trips ?? 0} wyjazdów
						</Typography>
					</Box>

					<Button
						variant="contained"
						color="error"
						onClick={logout}
						sx={{
							borderRadius: 999,
							px: 3,
							py: 1.1,
							fontWeight: 900,
							textTransform: "none",
							background:
								"linear-gradient(135deg, rgba(239,68,68,.95), rgba(244,63,94,.95))",
							boxShadow: "0 16px 40px rgba(244,63,94,.28)",
							"&:hover": {
								transform: "translateY(-2px)",
								boxShadow: "0 20px 50px rgba(244,63,94,.38)",
							},
						}}
					>
						Wyloguj
					</Button>
				</Stack>
			</Stack>
		</Box>
	);
}

function StatCard({
	title,
	value,
	suffix = "",
	icon,
	glow,
	clickable = false,
}) {
	return (
		<Card
			sx={{
				height: "100%",
				borderRadius: 6,
				position: "relative",
				overflow: "hidden",
				color: "#fff",
				background:
					"linear-gradient(145deg, rgba(255,255,255,.14), rgba(255,255,255,.045))",
				border: "1px solid rgba(255,255,255,.13)",
				boxShadow: `0 24px 70px rgba(0,0,0,.28), 0 0 45px ${glow}22`,
				backdropFilter: "blur(18px)",
				transition: ".28s ease",
				"&:hover": {
					transform: clickable
						? "translateY(-8px) scale(1.02)"
						: "translateY(-5px)",
					borderColor: `${glow}99`,
					boxShadow: `0 30px 80px rgba(0,0,0,.36), 0 0 70px ${glow}44`,
				},
				"&::after": {
					content: '""',
					position: "absolute",
					width: 110,
					height: 110,
					right: -38,
					top: -38,
					borderRadius: "50%",
					background: glow,
					opacity: 0.2,
					filter: "blur(4px)",
				},
			}}
		>
			<CardContent sx={{ position: "relative", zIndex: 1 }}>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Box>
						<Typography
							color="rgba(255,255,255,.58)"
							variant="body2"
						>
							{title}
						</Typography>

						<Typography
							variant="h4"
							fontWeight={950}
							sx={{ letterSpacing: "-.04em" }}
						>
							{value} {suffix}
						</Typography>
					</Box>

					<Box
						sx={{
							width: 48,
							height: 48,
							borderRadius: 4,
							display: "grid",
							placeItems: "center",
							fontSize: 27,
							background: "rgba(255,255,255,.1)",
							border: "1px solid rgba(255,255,255,.15)",
						}}
					>
						{icon}
					</Box>
				</Stack>
			</CardContent>
		</Card>
	);
}

function HighlightCard({ eyebrow, title, description, icon, accent }) {
	return (
		<Card
			sx={{
				height: "100%",
				borderRadius: 6,
				color: "#fff",
				background:
					"linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.05))",
				border: "1px solid rgba(255,255,255,.14)",
				boxShadow: "0 24px 70px rgba(0,0,0,.3)",
				backdropFilter: "blur(20px)",
				overflow: "hidden",
				position: "relative",
				"&::before": {
					content: '""',
					position: "absolute",
					inset: 0,
					background: accent,
					opacity: 0.12,
				},
			}}
		>
			<CardContent sx={{ position: "relative", zIndex: 1, p: 3 }}>
				<Stack direction="row" spacing={2} alignItems="center">
					<Box
						sx={{
							width: 62,
							height: 62,
							borderRadius: 5,
							display: "grid",
							placeItems: "center",
							fontSize: 34,
							background: accent,
							boxShadow: "0 20px 50px rgba(0,0,0,.3)",
						}}
					>
						{icon}
					</Box>

					<Box>
						<Typography
							variant="body2"
							sx={{
								color: "rgba(255,255,255,.6)",
								fontWeight: 900,
								textTransform: "uppercase",
								letterSpacing: ".1em",
							}}
						>
							{eyebrow}
						</Typography>

						<Typography variant="h5" fontWeight={950}>
							{title}
						</Typography>
					</Box>
				</Stack>

				<Typography color="rgba(255,255,255,.72)" sx={{ mt: 2 }}>
					{description}
				</Typography>
			</CardContent>
		</Card>
	);
}

function TripSection({
	title,
	subtitle,
	icon,
	trips,
	user,
	emptyTitle,
	emptyDescription,
	onTripClick,
}) {
	return (
		<Box>
			<Stack
				direction={{ xs: "column", sm: "row" }}
				justifyContent="space-between"
				alignItems={{ xs: "flex-start", sm: "center" }}
				spacing={1.5}
				sx={{ mb: 2 }}
			>
				<Box>
					<Stack direction="row" spacing={1.2} alignItems="center">
						<Typography sx={{ fontSize: 28 }}>{icon}</Typography>

						<Typography variant="h5" fontWeight={950}>
							{title}
						</Typography>
					</Stack>

					<Typography
						variant="body2"
						sx={{ color: "rgba(255,255,255,.58)", mt: 0.5 }}
					>
						{subtitle}
					</Typography>
				</Box>

				<Chip
					label={`${trips.length} wyjazdów`}
					sx={{
						color: "#fff",
						fontWeight: 900,
						background:
							"linear-gradient(135deg, rgba(34,211,238,.35), rgba(168,85,247,.35))",
						border: "1px solid rgba(255,255,255,.16)",
					}}
				/>
			</Stack>

			{trips.length === 0 ? (
				<EmptyState
					icon="🗂️"
					title={emptyTitle}
					description={emptyDescription}
				/>
			) : (
				<Grid container spacing={2.5}>
					{trips.map((trip) => (
						<Grid item xs={12} sm={6} md={4} key={trip.id}>
							<TripCard
								trip={trip}
								user={user}
								onClick={() => onTripClick(trip)}
							/>
						</Grid>
					))}
				</Grid>
			)}
		</Box>
	);
}

function TripCard({ trip, user, onClick }) {
	const isPlanned = trip.status === "planned";
	const presenceInfo = getUserPresenceInfo(trip, user);

	return (
		<Card
			variant="outlined"
			onClick={onClick}
			sx={{
				cursor: "pointer",
				height: "100%",
				borderRadius: 6,
				color: "#fff",
				position: "relative",
				overflow: "hidden",
				background:
					"linear-gradient(145deg, rgba(15,23,42,.78), rgba(30,41,59,.5))",
				border: "1px solid rgba(255,255,255,.12)",
				transition: ".3s ease",
				"&:hover": {
					transform: "translateY(-10px)",
					borderColor: presenceInfo.border,
					boxShadow: `0 30px 80px ${presenceInfo.shadow}`,
				},
				"&::before": {
					content: '""',
					position: "absolute",
					inset: 0,
					background: isPlanned
						? "radial-gradient(circle at top right, rgba(251,191,36,.25), transparent 45%)"
						: "radial-gradient(circle at top right, rgba(34,197,94,.22), transparent 45%)",
				},
			}}
		>
			<CardContent sx={{ position: "relative", zIndex: 1, p: 2.5 }}>
				<Stack
					direction="row"
					justifyContent="space-between"
					spacing={2}
				>
					<Box>
						<Typography variant="h6" fontWeight={950}>
							{trip.title}
						</Typography>

						<Typography color="rgba(255,255,255,.62)">
							📍 {trip.location}
						</Typography>
					</Box>

					<Box sx={{ fontSize: 30 }}>{isPlanned ? "🛫" : "✅"}</Box>
				</Stack>

				<Typography
					variant="body2"
					sx={{ mt: 2, color: "rgba(255,255,255,.7)" }}
				>
					{trip.start_date} — {trip.end_date}
				</Typography>

				<Stack
					direction="row"
					spacing={1}
					flexWrap="wrap"
					useFlexGap
					sx={{ mt: 2 }}
				>
					<Chip
						label={trip.trip_type_name}
						size="small"
						sx={{
							color: "#fff",
							fontWeight: 800,
							background: "rgba(255,255,255,.12)",
							border: "1px solid rgba(255,255,255,.16)",
						}}
					/>

					<Chip
						label={getStatusLabel(trip.status)}
						size="small"
						sx={{
							color: "#fff",
							fontWeight: 900,
							background: isPlanned
								? "linear-gradient(135deg, #f59e0b, #f97316)"
								: "linear-gradient(135deg, #16a34a, #14b8a6)",
						}}
					/>
				</Stack>

				<Box
					sx={{
						mt: 2,
						p: 1.3,
						borderRadius: 4,
						background: "rgba(255,255,255,.08)",
						border: "1px solid rgba(255,255,255,.1)",
					}}
				>
					<Typography variant="body2" color="rgba(255,255,255,.68)">
						Uczestnicy
					</Typography>

					<Typography variant="h6" fontWeight={950}>
						{trip.participants_count}
					</Typography>
				</Box>

				<Box
					sx={{
						mt: 1.5,
						p: 1.3,
						borderRadius: 4,
						background: presenceInfo.background,
						border: `1px solid ${presenceInfo.border}`,
						boxShadow: `0 0 28px ${presenceInfo.shadow}`,
					}}
				>
					<Stack direction="row" spacing={1.2} alignItems="center">
						<Typography sx={{ fontSize: 22 }}>
							{presenceInfo.icon}
						</Typography>

						<Box>
							<Typography
								variant="body2"
								sx={{
									color: presenceInfo.color,
									fontWeight: 950,
								}}
							>
								{presenceInfo.shortLabel}
							</Typography>

							<Typography
								variant="caption"
								sx={{ color: "rgba(255,255,255,.58)" }}
							>
								Twoja obecność
							</Typography>
						</Box>
					</Stack>
				</Box>
			</CardContent>
		</Card>
	);
}

function GlassCard({ children }) {
	return (
		<Card
			sx={{
				height: "100%",
				borderRadius: 7,
				color: "#fff",
				background:
					"linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.045))",
				border: "1px solid rgba(255,255,255,.13)",
				boxShadow: "0 30px 90px rgba(0,0,0,.3)",
				backdropFilter: "blur(22px)",
			}}
		>
			<CardContent sx={{ p: { xs: 2, md: 3 } }}>{children}</CardContent>
		</Card>
	);
}

function SectionHeader({ kicker, title, icon }) {
	return (
		<Stack
			direction="row"
			justifyContent="space-between"
			alignItems="center"
			sx={{ mb: 2.5 }}
		>
			<Box>
				<Typography
					variant="body2"
					sx={{
						color: "rgba(255,255,255,.52)",
						fontWeight: 900,
						textTransform: "uppercase",
						letterSpacing: ".1em",
					}}
				>
					{kicker}
				</Typography>

				<Typography variant="h5" fontWeight={950}>
					{title}
				</Typography>
			</Box>

			<Box
				sx={{
					width: 52,
					height: 52,
					borderRadius: 4,
					display: "grid",
					placeItems: "center",
					fontSize: 30,
					background: "rgba(255,255,255,.1)",
					border: "1px solid rgba(255,255,255,.14)",
				}}
			>
				{icon}
			</Box>
		</Stack>
	);
}

function RankBadge({ index }) {
	const styles = [
		{
			label: "🥇",
			bg: "linear-gradient(135deg, #facc15, #f97316)",
		},
		{
			label: "🥈",
			bg: "linear-gradient(135deg, #e5e7eb, #94a3b8)",
		},
		{
			label: "🥉",
			bg: "linear-gradient(135deg, #fb923c, #92400e)",
		},
	];

	if (index < 3) {
		return (
			<Box
				sx={{
					width: 36,
					height: 36,
					borderRadius: "50%",
					display: "grid",
					placeItems: "center",
					background: styles[index].bg,
					boxShadow: "0 0 25px rgba(255,255,255,.2)",
					fontSize: 20,
				}}
			>
				{styles[index].label}
			</Box>
		);
	}

	return (
		<Box
			sx={{
				width: 36,
				height: 36,
				borderRadius: "50%",
				display: "grid",
				placeItems: "center",
				background: "rgba(255,255,255,.08)",
				border: "1px solid rgba(255,255,255,.12)",
				fontWeight: 900,
			}}
		>
			{index + 1}
		</Box>
	);
}

function EmptyState({ icon, title, description }) {
	return (
		<Box
			sx={{
				p: 4,
				textAlign: "center",
				borderRadius: 6,
				background: "rgba(255,255,255,.06)",
				border: "1px dashed rgba(255,255,255,.18)",
			}}
		>
			<Typography sx={{ fontSize: 48 }}>{icon}</Typography>

			<Typography variant="h6" fontWeight={900}>
				{title}
			</Typography>

			<Typography color="rgba(255,255,255,.62)">{description}</Typography>
		</Box>
	);
}

function FloatingOrb({ sx }) {
	return (
		<Box
			sx={{
				position: "absolute",
				borderRadius: "50%",
				filter: "blur(35px)",
				opacity: 0.8,
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

function BadgeDialog({ selectedBadge, onClose }) {
	return (
		<Dialog
			open={Boolean(selectedBadge)}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={dialogPaperProps}
		>
			<DialogTitle sx={dialogTitleSx}>
				{selectedBadge?.badge_name}
			</DialogTitle>

			<DialogContent>
				<Box sx={{ textAlign: "center", color: "#fff", p: 2 }}>
					{selectedBadge?.badge_image_url ? (
						<Box
							component="img"
							src={selectedBadge.badge_image_url}
							alt={selectedBadge.badge_name}
							sx={{
								maxWidth: 190,
								maxHeight: 190,
								objectFit: "contain",
								mb: 2,
								filter: "drop-shadow(0 0 35px rgba(168,85,247,.45))",
							}}
						/>
					) : (
						<Typography sx={{ fontSize: 90, mb: 2 }}>🎖️</Typography>
					)}

					<Typography sx={{ mb: 1, color: "rgba(255,255,255,.82)" }}>
						{selectedBadge?.badge_description ||
							"Brak opisu odznaki"}
					</Typography>

					{selectedBadge?.reason && (
						<Typography color="rgba(255,255,255,.58)">
							Powód przyznania: {selectedBadge.reason}
						</Typography>
					)}
				</Box>
			</DialogContent>
		</Dialog>
	);
}

function TripDialog({ selectedTrip, user, onClose }) {
	const [participantsOpen, setParticipantsOpen] = useState(false);
	const presenceInfo = getUserPresenceInfo(selectedTrip, user);
	const participants = selectedTrip?.participants || [];

	return (
		<>
			<Dialog
				open={Boolean(selectedTrip)}
				onClose={onClose}
				maxWidth="sm"
				fullWidth
				PaperProps={dialogPaperProps}
			>
				<DialogTitle sx={dialogTitleSx}>
					{selectedTrip?.title}
				</DialogTitle>

				<DialogContent>
					<Stack spacing={1.5} sx={{ color: "#fff", p: 1 }}>
						<InfoLine
							label="Miejsce"
							value={selectedTrip?.location}
						/>

						<InfoLine
							label="Data"
							value={`${selectedTrip?.start_date || "-"} — ${
								selectedTrip?.end_date || "-"
							}`}
						/>

						<InfoLine
							label="Typ"
							value={selectedTrip?.trip_type_name}
						/>

						<InfoLine
							label="Status"
							value={getStatusLabel(selectedTrip?.status)}
						/>

						<ParticipantsInfoLine
							count={selectedTrip?.participants_count}
							total={participants.length}
							onClick={() => setParticipantsOpen(true)}
						/>

						<InfoLine
							label="Twoja obecność"
							value={`${presenceInfo.icon} ${presenceInfo.label}`}
							color={presenceInfo.color}
							background={presenceInfo.background}
							border={presenceInfo.border}
						/>

						<Box sx={{ mt: 1 }}>
							<Typography fontWeight={900}>Opis</Typography>

							<Typography color="rgba(255,255,255,.65)">
								{selectedTrip?.description || "Brak opisu."}
							</Typography>
						</Box>
					</Stack>
				</DialogContent>
			</Dialog>

			<ParticipantsDialog
				open={participantsOpen}
				onClose={() => setParticipantsOpen(false)}
				participants={participants}
				tripStatus={selectedTrip?.status}
			/>
		</>
	);
}

function ParticipantsInfoLine({ count, total, onClick }) {
	return (
		<Box
			onClick={onClick}
			sx={{
				p: 1.5,
				borderRadius: 4,
				background:
					"linear-gradient(135deg, rgba(34,211,238,.13), rgba(168,85,247,.13))",
				border: "1px solid rgba(125,211,252,.35)",
				cursor: "pointer",
				transition: ".25s ease",
				"&:hover": {
					transform: "translateY(-2px)",
					borderColor: "rgba(125,211,252,.7)",
					boxShadow: "0 0 35px rgba(34,211,238,.18)",
				},
			}}
		>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
			>
				<Box>
					<Typography color="rgba(255,255,255,.55)" variant="body2">
						Uczestnicy
					</Typography>

					<Typography fontWeight={900}>
						👥 {count ?? 0} obecnych / {total ?? 0} zapisanych
					</Typography>
				</Box>

				<Chip
					label="Pokaż"
					size="small"
					sx={{
						color: "#fff",
						fontWeight: 900,
						background:
							"linear-gradient(135deg, rgba(34,211,238,.65), rgba(168,85,247,.65))",
					}}
				/>
			</Stack>
		</Box>
	);
}

function ParticipantsDialog({ open, onClose, participants, tripStatus }) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={dialogPaperProps}
		>
			<DialogTitle sx={dialogTitleSx}>👥 Uczestnicy wyjazdu</DialogTitle>

			<DialogContent>
				{participants.length === 0 ? (
					<EmptyState
						icon="🕳️"
						title="Brak uczestników"
						description="Do tego wyjazdu nie przypisano jeszcze żadnych uczestników."
					/>
				) : (
					<Stack spacing={1.2} sx={{ p: 1 }}>
						{participants.map((participant) => {
							const status = getAttendanceInfo(
								participant.attendance_status,
								tripStatus,
							);

							return (
								<Box
									key={participant.id}
									sx={{
										p: 1.5,
										borderRadius: 4,
										background: "rgba(255,255,255,.07)",
										border: "1px solid rgba(255,255,255,.1)",
									}}
								>
									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										spacing={2}
									>
										<Stack
											direction="row"
											spacing={1.5}
											alignItems="center"
										>
											<Avatar
												sx={{
													width: 42,
													height: 42,
													fontWeight: 900,
													background:
														"linear-gradient(135deg, #7c3aed, #06b6d4)",
												}}
											>
												{
													(participant.display_name ||
														participant.username ||
														"?")?.[0]
												}
											</Avatar>

											<Box>
												<Typography
													color="#fff"
													fontWeight={900}
												>
													{participant.display_name ||
														participant.username ||
														"Nieznany użytkownik"}
												</Typography>

												<Typography
													variant="body2"
													color="rgba(255,255,255,.55)"
												>
													@
													{participant.username ||
														"brak_loginu"}
												</Typography>
											</Box>
										</Stack>

										<Chip
											label={`${status.icon} ${status.label}`}
											size="small"
											sx={{
												color: status.color,
												fontWeight: 900,
												background: status.background,
												border: `1px solid ${status.border}`,
											}}
										/>
									</Stack>
								</Box>
							);
						})}
					</Stack>
				)}
			</DialogContent>
		</Dialog>
	);
}

function RankDialog({ selectedRank, onClose }) {
	return (
		<Dialog
			open={Boolean(selectedRank)}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={dialogPaperProps}
		>
			<DialogTitle sx={dialogTitleSx}>
				👑 {selectedRank?.name}
			</DialogTitle>

			<DialogContent>
				<Stack spacing={1.5} sx={{ color: "#fff", p: 1 }}>
					<InfoLine
						label="Wynik użytkownika"
						value={`${selectedRank?.score} pkt`}
					/>

					<Typography color="rgba(255,255,255,.68)">
						{selectedRank?.description || "Brak opisu rangi."}
					</Typography>
				</Stack>
			</DialogContent>
		</Dialog>
	);
}

function InfoLine({
	label,
	value,
	color = "#fff",
	background = "rgba(255,255,255,.07)",
	border = "rgba(255,255,255,.1)",
}) {
	return (
		<Box
			sx={{
				p: 1.5,
				borderRadius: 4,
				background,
				border: `1px solid ${border}`,
			}}
		>
			<Typography color="rgba(255,255,255,.55)" variant="body2">
				{label}
			</Typography>

			<Typography fontWeight={900} sx={{ color }}>
				{value || "-"}
			</Typography>
		</Box>
	);
}

const dialogPaperProps = {
	sx: {
		borderRadius: 6,
		color: "#fff",
		background:
			"linear-gradient(145deg, rgba(15,23,42,.96), rgba(30,41,59,.96))",
		border: "1px solid rgba(255,255,255,.14)",
		boxShadow: "0 40px 100px rgba(0,0,0,.55)",
		backdropFilter: "blur(24px)",
	},
};

const dialogTitleSx = {
	color: "#fff",
	fontWeight: 950,
	fontSize: 26,
};

function getStatusLabel(status) {
	if (status === "planned") return "Planowany";
	if (status === "finished") return "Zakończony";
	if (status === "cancelled") return "Anulowany";
	return status || "-";
}

function getAttendanceInfo(status, tripStatus) {
	const isPlanned = tripStatus === "planned";

	if (status === "present") {
		return {
			label: isPlanned ? "Weźmie udział" : "Był",
			icon: "✅",
			color: "#22c55e",
			background: "rgba(34,197,94,.16)",
			border: "rgba(34,197,94,.45)",
		};
	}

	if (status === "absent") {
		return {
			label: isPlanned ? "Nie będzie" : "Nie było",
			icon: "❌",
			color: "#fb7185",
			background: "rgba(244,63,94,.16)",
			border: "rgba(244,63,94,.45)",
		};
	}

	return {
		label: isPlanned ? "Bez deklaracji" : "Niepotwierdzone",
		icon: "⏳",
		color: "#facc15",
		background: "rgba(250,204,21,.14)",
		border: "rgba(250,204,21,.45)",
	};
}

function isUserPresentOnTrip(trip, user) {
	if (!trip?.participants || !Array.isArray(trip.participants) || !user?.id) {
		return false;
	}

	return trip.participants.some(
		(participant) =>
			participant.user_id === user.id &&
			participant.attendance_status === "present",
	);
}

function getUserPresenceInfo(trip, user) {
	const isPlanned = trip?.status === "planned";

	if (!trip?.participants || !Array.isArray(trip.participants) || !user?.id) {
		return isPlanned
			? {
					label: "Brak informacji, czy weźmiesz udział",
					shortLabel: "Brak deklaracji",
					color: "#facc15",
					background: "rgba(250,204,21,.14)",
					border: "rgba(250,204,21,.45)",
					shadow: "rgba(250,204,21,.16)",
					icon: "❔",
				}
			: {
					label: "Brak informacji o Twojej obecności",
					shortLabel: "Brak danych",
					color: "#facc15",
					background: "rgba(250,204,21,.14)",
					border: "rgba(250,204,21,.45)",
					shadow: "rgba(250,204,21,.16)",
					icon: "❔",
				};
	}

	const userParticipant = trip.participants.find(
		(participant) => participant.user_id === user.id,
	);

	if (!userParticipant) {
		return isPlanned
			? {
					label: "Nie jesteś zapisana/zapisany na ten wyjazd",
					shortLabel: "Nie jesteś zapisana/zapisany",
					color: "#fb7185",
					background: "rgba(244,63,94,.16)",
					border: "rgba(244,63,94,.5)",
					shadow: "rgba(244,63,94,.18)",
					icon: "🚫",
				}
			: {
					label: "Nie było Cię na tym wyjeździe",
					shortLabel: "Nie było Cię",
					color: "#fb7185",
					background: "rgba(244,63,94,.16)",
					border: "rgba(244,63,94,.5)",
					shadow: "rgba(244,63,94,.18)",
					icon: "❌",
				};
	}

	if (userParticipant.attendance_status === "present") {
		return isPlanned
			? {
					label: "Weźmiesz udział w tym wyjeździe",
					shortLabel: "Weźmiesz udział",
					color: "#22c55e",
					background: "rgba(34,197,94,.16)",
					border: "rgba(34,197,94,.5)",
					shadow: "rgba(34,197,94,.18)",
					icon: "✅",
				}
			: {
					label: "Byłeś na tym wyjeździe",
					shortLabel: "Byłeś",
					color: "#22c55e",
					background: "rgba(34,197,94,.16)",
					border: "rgba(34,197,94,.5)",
					shadow: "rgba(34,197,94,.18)",
					icon: "✅",
				};
	}

	if (userParticipant.attendance_status === "absent") {
		return isPlanned
			? {
					label: "Nie będzie Cię na tym wyjeździe",
					shortLabel: "Nie będzie Cię",
					color: "#fb7185",
					background: "rgba(244,63,94,.16)",
					border: "rgba(244,63,94,.5)",
					shadow: "rgba(244,63,94,.18)",
					icon: "❌",
				}
			: {
					label: "Nie było Cię na tym wyjeździe",
					shortLabel: "Nie było Cię",
					color: "#fb7185",
					background: "rgba(244,63,94,.16)",
					border: "rgba(244,63,94,.5)",
					shadow: "rgba(244,63,94,.18)",
					icon: "❌",
				};
	}

	return isPlanned
		? {
				label: "Twoja obecność nie została jeszcze zadeklarowana",
				shortLabel: "Nie zadeklarowano",
				color: "#facc15",
				background: "rgba(250,204,21,.14)",
				border: "rgba(250,204,21,.45)",
				shadow: "rgba(250,204,21,.16)",
				icon: "⏳",
			}
		: {
				label: "Twoja obecność nie została potwierdzona",
				shortLabel: "Niepotwierdzone",
				color: "#facc15",
				background: "rgba(250,204,21,.14)",
				border: "rgba(250,204,21,.45)",
				shadow: "rgba(250,204,21,.16)",
				icon: "⏳",
			};
}

function getCurrentTripText(trip) {
	return {
		title: "Teraz trwa wyjazd",
		description: `${trip.title} do ${trip.location}, termin: ${trip.start_date} – ${trip.end_date}`,
	};
}

function getCountdownText(trip) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const start = new Date(trip.start_date);
	start.setHours(0, 0, 0, 0);

	const diffMs = start - today;
	const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	if (days > 0) {
		return {
			title: `Następny wyjazd za ${days} dni`,
			description: `${trip.title} do ${trip.location}, start: ${trip.start_date}`,
		};
	}

	if (days === 0) {
		return {
			title: "Następny wyjazd zaczyna się dzisiaj",
			description: `${trip.title} do ${trip.location}`,
		};
	}

	return {
		title: "Następny zaplanowany wyjazd już trwa",
		description: `${trip.title} do ${trip.location}, start był: ${trip.start_date}`,
	};
}

function getLastTripText(trip) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const end = new Date(trip.end_date);
	end.setHours(0, 0, 0, 0);

	const diffMs = today - end;
	const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

	return {
		title: `Ostatni wyjazd był ${days} dni temu`,
		description: `Był to wyjazd do ${trip.location}: ${trip.title}`,
	};
}
