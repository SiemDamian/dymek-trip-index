import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const loadCurrentUser = async () => {
		const accessToken = localStorage.getItem("accessToken");

		if (!accessToken) {
			setUser(null);
			setLoading(false);
			return;
		}

		try {
			const res = await api.get("accounts/me/");
			setUser(res.data);
		} catch {
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadCurrentUser();
	}, []);

	const login = async (username, password) => {
		const res = await api.post("accounts/login/", { username, password });

		localStorage.setItem("accessToken", res.data.access);
		localStorage.setItem("refreshToken", res.data.refresh);

		setUser(res.data.user);
	};

	const logout = async () => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{ user, login, logout, loading, loadCurrentUser }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
