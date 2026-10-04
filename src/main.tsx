import React, { useState, useEffect, useContext, createContext } from "react";
import { createRoot } from "react-dom/client";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  ArrowLeftRight,
  CalendarDays,
  Car,
  Check,
  CircleHelp,
  Compass,
  Leaf,
  MapPin,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Users,
  X,
  Route,
  BadgeCheck,
} from "lucide-react";
import { cn } from "./lib/utils";
import { Button } from "./components/ui/button";
import { DatePicker } from "./components/ui/date-picker";
import {
  useLocationStore,
  LocationPanel,
  LocationChatCard,
  SharedLocationPage,
} from "./features/location/location";
import "./style.css";
type Trip = {
  id: number;
  from: string;
  to: string;
  date: string;
  time: string;
  end: string;
  price: number;
  name: string;
  rating: string;
  car: string;
  seats: number;
  color: string;
};
const today = new Date().toLocaleDateString("en-CA");
const initial: Trip[] = [
  {
    id: 1,
    from: "Москва",
    to: "Санкт-Петербург",
    date: today,
    time: "08:00",
    end: "15:30",
    price: 1800,
    name: "Александр",
    rating: "4.9",
    car: "Kia K5",
    seats: 3,
    color: "orange",
  },
  {
    id: 2,
    from: "Москва",
    to: "Казань",
    date: today,
    time: "09:30",
    end: "21:00",
    price: 2400,
    name: "Мария",
    rating: "5.0",
    car: "Volkswagen Polo",
    seats: 2,
    color: "pink",
  },
  {
    id: 3,
    from: "Москва",
    to: "Нижний Новгород",
    date: today,
    time: "11:00",
    end: "16:00",
    price: 1200,
    name: "Дмитрий",
    rating: "4.8",
    car: "Škoda Octavia",
    seats: 3,
    color: "blue",
  },
];
const useStore = create(
  persist<{
    dark: boolean;
    user: boolean;
    trips: Trip[];
    booked: number[];
    messages: string[];
    toggle: () => void;
    login: () => void;
    logout: () => void;
    add: (t: Trip) => void;
    book: (id: number) => void;
    send: (m: string) => void;
  }>(
    (set) => ({
      dark: false,
      user: false,
      trips: initial,
      booked: [],
      messages: [],
      toggle: () => set((s) => ({ dark: !s.dark })),
      login: () => set({ user: true }),
      logout: () => set({ user: false }),
      add: (t) => set((s) => ({ trips: [t, ...s.trips] })),
      book: (id) =>
        set((s) => ({
          booked: s.booked.includes(id) ? s.booked : [...s.booked, id],
        })),
      send: (m) => set((s) => ({ messages: [...s.messages, m] })),
    }),
    { name: "poputi-demo" },
  ),
);
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const dark = useStore((s) => s.dark);
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content className={cn("modal", dark && "dark")}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description className="muted">
            По пути · дипломный MVP на демонстрационных данных
          </Dialog.Description>
          <Dialog.Close className="close" aria-label="Закрыть">
            <X size={20} />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
const AuthContext = createContext<() => void>(() => {});
function App() {
  const navigate = useNavigate();
  const s = useStore();
  const [auth, setAuth] = useState(false);
  const [createOpen, setCreate] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <div className={cn("app", s.dark && "dark")}>
      <header>
        <Link to="/" className="logo">
          <span className="logo-icon">
            <Route size={25} />
          </span>
          по пути<span className="logo-dot">.</span>
        </Link>
        <nav>
          <Link
            to="/"
            activeProps={{ className: "active" }}
            activeOptions={{ exact: true }}
          >
            <Search size={17} />
            Найти поездку
          </Link>
          <Link to="/trips">
            <Car size={18} />
            Мои поездки
          </Link>
          <Link to="/chats">
            <MessageCircle size={18} />
            Сообщения
            <span className="nav-dot" />
          </Link>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={s.toggle}
            aria-label="Переключить тему"
          >
            {s.dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="publish" onClick={() => setCreate(true)}>
            <Plus size={18} />
            Создать поездку
          </button>
          {s.user ? (
            <Link to="/profile" className="avatar small blue">
              В
            </Link>
          ) : (
            <button className="login" onClick={() => setAuth(true)}>
              Войти
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </header>
      <AuthContext.Provider value={() => setAuth(true)}>
        <Outlet />
      </AuthContext.Provider>
      <div className="mobile-nav">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          activeProps={{ className: "active" }}
        >
          <Search size={20} />
          Поиск
        </Link>
        <Link to="/trips" activeProps={{ className: "active" }}>
          <Car size={20} />
          Поездки
        </Link>
        <Link to="/chats" activeProps={{ className: "active" }}>
          <MessageCircle size={20} />
          Чаты
        </Link>
        <Link to="/profile" activeProps={{ className: "active" }}>
          <Users size={20} />
          Профиль
        </Link>
      </div>
      <footer>
        <Link to="/" className="logo">
          по пути.
        </Link>
        <span>Хорошие поездки начинаются с хорошей компании.</span>
        <span>© 2026 По пути · Демо-проект</span>
        <button
          onClick={() =>
            setNotice(
              "Это учебный MVP. Все профили, проверки и поездки — демонстрационные.",
            )
          }
        >
          <CircleHelp size={16} />
          Помощь
        </button>
      </footer>
      <Modal open={auth} onClose={() => setAuth(false)} title="С возвращением!">
        <Auth
          done={() => {
            s.login();
            setAuth(false);
            void navigate({ to: "/profile" });
          }}
        />
      </Modal>
      <Modal
        open={createOpen}
        onClose={() => setCreate(false)}
        title="Создать поездку"
      >
        <CreateTrip
          done={() => {
            setCreate(false);
            setNotice("Поездка опубликована. Она уже доступна в поиске.");
          }}
        />
      </Modal>
      <Modal open={!!notice} onClose={() => setNotice("")} title="По пути">
        <p>{notice}</p>
        <button className="primary full" onClick={() => setNotice("")}>
          Понятно
        </button>
      </Modal>
    </div>
  );
}
function Auth({ done }: { done: () => void }) {
  const [signup, setSignup] = useState(false);
  return (
    <>
      <p>Войдите, чтобы бронировать места и общаться с попутчиками.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          localStorage.setItem("profile-email", String(data.get("email")));
          if (signup) {
            localStorage.setItem("profile-name", String(data.get("name")));
            localStorage.setItem("profile-email", String(data.get("email")));
          }
          done();
        }}
      >
        {signup && (
          <label>
            Ваше имя
            <input name="name" required placeholder="Как вас зовут?" />
          </label>
        )}
        <label>
          Электронная почта
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </label>
        <label>
          Пароль
          <input
            type="password"
            minLength={6}
            required
            placeholder="Не менее 6 символов"
          />
        </label>
        <Button type="submit" className="primary full">
          {signup ? "Создать демо-аккаунт" : "Войти"}
        </Button>
      </form>
      <button className="text-button full" onClick={() => setSignup(!signup)}>
        {signup
          ? "Уже есть аккаунт? Войти"
          : "Нет аккаунта? Зарегистрироваться"}
      </button>
      <div className="divider">или быстрый демо-вход</div>
      <button
        type="button"
        className="social gos"
        onClick={done}
        aria-label="Войти через Госуслуги"
      >
        <span>Войти через</span>
        <img
          src="/brands/gosuslugi.svg"
          alt="Госуслуги"
          className="provider-logo gos-logo"
        />
      </button>
      <button
        type="button"
        className="social max"
        onClick={done}
        aria-label="Войти через MAX"
      >
        <span>Войти через</span>
        <img
          src="/brands/max.svg"
          alt="MAX"
          className="provider-logo max-logo"
        />
      </button>
      <small className="muted">
        Интеграции имитируются. Данные не передаются внешним сервисам.
      </small>
    </>
  );
}
function CreateTrip({ done }: { done: () => void }) {
  const s = useStore();
  const [departureDate, setDepartureDate] = useState(today);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        s.add({
          id: Date.now(),
          from: String(d.get("from")),
          to: String(d.get("to")),
          date: String(d.get("date")),
          time: String(d.get("time")),
          end: "—",
          price: Number(d.get("price")),
          name: "Вы",
          rating: "5.0",
          car: String(d.get("car")),
          seats: Number(d.get("seats")),
          color: "blue",
        });
        done();
      }}
    >
      <div className="form-grid">
        <label>
          Откуда
          <input name="from" required placeholder="Москва" />
        </label>
        <label>
          Куда
          <input name="to" required placeholder="Тверь" />
        </label>
        <div className="date-field">
          <span className="date-field-label">Дата</span>
          <DatePicker
            name="date"
            label="Дата поездки"
            value={departureDate}
            onChange={setDepartureDate}
            min={today}
            dark={s.dark}
            inDialog
          />
        </div>
        <label>
          Время
          <input name="time" type="time" defaultValue="09:00" required />
        </label>
        <label>
          Стоимость, ₽
          <input
            name="price"
            type="number"
            min="1"
            defaultValue="1000"
            required
          />
        </label>
        <label>
          Свободных мест
          <input
            name="seats"
            type="number"
            min="1"
            max="8"
            defaultValue="3"
            required
          />
        </label>
      </div>
      <label>
        Автомобиль
        <input name="car" required placeholder="Kia K5" />
      </label>
      <Button className="primary full">
        Опубликовать поездку
        <ArrowRight size={17} />
      </Button>
    </form>
  );
}
function Home() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [people, setPeople] = useState("1");
  const [searched, setSearched] = useState(false);
  const [chosen, setChosen] = useState<Trip | null>(null);
  const s = useStore();
  const trips = s.trips.filter(
    (t) =>
      !searched ||
      ((!from || t.from.toLowerCase().includes(from.toLowerCase())) &&
        (!to || t.to.toLowerCase().includes(to.toLowerCase())) &&
        (!date || t.date === date) &&
        t.seats >= Number(people)),
  );
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span />
            БОЛЬШЕ, ЧЕМ ПРОСТО ПОЕЗДКА
          </div>
          <h1>
            В одном направлении.
            <br />
            <span>На одной волне.</span>
          </h1>
          <p>
            Найдите попутчиков, разделите расходы
            <br />и превратите дорогу в маленькое приключение.
          </p>
          <div className="hero-proof">
            <div className="avatar-stack">
              <span className="avatar orange">А</span>
              <span className="avatar pink">М</span>
              <span className="avatar blue">Д</span>
              <span className="avatar green">Е</span>
            </div>
            <div>
              <div className="stars">★★★★★</div>
              <small>Хорошая компания уже в пути</small>
            </div>
          </div>
        </div>
        <div className="hero-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="route-line" />
          <div className="pin start">
            <MapPin size={25} />
          </div>
          <div className="pin finish">
            <MapPin size={25} />
          </div>
          <div className="art-label label-start">Москва</div>
          <div className="art-label label-end">Санкт-Петербург</div>
          <div className="car-illustration">
            <div className="car-roof" />
            <div className="car-body">
              <div className="car-window" />
              <div className="car-light" />
              <div className="wheel wheel-one" />
              <div className="wheel wheel-two" />
            </div>
          </div>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="floating-card"
          >
            <span className="mini-icon">
              <Leaf size={20} />
            </span>
            <div>
              <b>Вместе — выгоднее</b>
              <small>Меньше расходов, больше историй</small>
            </div>
            <Sparkles size={18} />
          </motion.div>
          <span className="art-spark spark-one">✦</span>
          <span className="art-spark spark-two">✦</span>
        </div>
      </section>
      <form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
          setSearched(true);
        }}
      >
        <label>
          <span>
            <span className="point" />
            Откуда
          </span>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Город отправления"
          />
        </label>
        <button
          type="button"
          className="swap"
          aria-label="Поменять города"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
        >
          <ArrowLeftRight size={17} />
        </button>
        <label>
          <span>
            <MapPin size={17} />
            Куда
          </span>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Город назначения"
          />
        </label>
        <div className="date-search date-field">
          <span>
            <CalendarDays size={17} />
            Когда
          </span>
          <DatePicker
            label="Когда — выбрать дату"
            value={date}
            onChange={setDate}
            min={today}
            dark={s.dark}
            clearable
          />
        </div>
        <label className="people-search">
          <span>
            <Users size={17} />
            Пассажиры
          </span>
          <select value={people} onChange={(e) => setPeople(e.target.value)}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "пассажир" : "пассажира"}
              </option>
            ))}
          </select>
        </label>
        <button className="primary search-submit">
          <Search size={19} />
          Найти поездку
        </button>
      </form>
      <section className="benefits">
        <div>
          <span className="benefit-icon">
            <ShieldCheck />
          </span>
          <div>
            <b>Спокойно в пути</b>
            <p>Проверенные профили и честные отзывы</p>
          </div>
        </div>
        <div>
          <span className="benefit-icon">
            <Users />
          </span>
          <div>
            <b>Ваша компания найдётся</b>
            <p>Попутчики с похожими планами</p>
          </div>
        </div>
        <div>
          <span className="benefit-icon">
            <Leaf />
          </span>
          <div>
            <b>Бережно к планете и кошельку</b>
            <p>Делим дорогу, расходы и впечатления</p>
          </div>
        </div>
      </section>
      <section className="popular">
        <div className="section-head">
          <div>
            <div className="eyebrow">ВДОХНОВЕНИЕ ДЛЯ ДОРОГИ</div>
            <h2>Куда отправимся?</h2>
          </div>
          <button
            className="text-button"
            onClick={() => {
              setSearched(true);
              document
                .getElementById("rides")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Все направления
            <ArrowRight size={17} />
          </button>
        </div>
        <div className="destination-grid">
          {[
            {
              city: "Санкт-Петербург",
              tag: "За новыми впечатлениями",
              price: "1 800",
              img: "photo-1556610961-2fecc5927173",
            },
            {
              city: "Казань",
              tag: "Навстречу открытиям",
              price: "2 400",
              img: "photo-1470770841072-f978cf4d019e",
            },
            {
              city: "Нижний Новгород",
              tag: "На выходные из города",
              price: "1 200",
              img: "photo-1513326738677-b964603b136d",
            },
          ].map((d, i) => (
            <button
              key={d.city}
              className={"destination destination-" + i}
              onClick={() => {
                setFrom("Москва");
                setTo(d.city);
                setSearched(true);
                document
                  .getElementById("rides")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <img
                src={
                  "https://images.unsplash.com/" +
                  d.img +
                  "?auto=format&fit=crop&w=900&q=85"
                }
                alt="Пейзаж для вдохновения на поездку"
              />
              <span className="destination-shade" />
              <span className="destination-content">
                <small>{d.tag}</small>
                <b>{d.city}</b>
                <span>
                  Из Москвы{" "}
                  <span className="dest-price">
                    от {d.price} ₽ <ArrowRight size={17} />
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
      <section id="rides" className="rides">
        <div className="section-head">
          <div>
            <h2>
              {searched ? "Подходящие поездки" : "Уже собираются в дорогу"}
            </h2>
            <p className="muted">
              {searched
                ? `Найдено поездок: ${trips.length}`
                : "Знакомьтесь с попутчиками и выбирайте свой маршрут"}
            </p>
          </div>
          <span className="live">
            <span />
            Доступные поездки
          </span>
        </div>
        <div className="trip-grid">
          {trips.map((t) => (
            <TripCard key={t.id} trip={t} onClick={() => setChosen(t)} />
          ))}
        </div>
        {!trips.length && (
          <div className="empty">
            <Compass size={35} />
            <h3>Пока нет подходящих поездок</h3>
            <p>Попробуйте другой город, дату или количество мест.</p>
            <button
              className="primary"
              onClick={() => {
                setFrom("");
                setTo("");
                setDate("");
                setSearched(false);
              }}
            >
              Сбросить поиск
            </button>
          </div>
        )}
      </section>
      <section className="banner">
        <div className="banner-icon">
          <Car size={37} />
        </div>
        <div>
          <h2>Ваше свободное место — чьё-то приключение</h2>
          <p>Разделите расходы на дорогу с приятной компанией.</p>
        </div>
        <Link to="/trips" className="banner-link">
          Стать водителем
          <ArrowRight size={18} />
        </Link>
      </section>
      <Modal
        open={!!chosen}
        onClose={() => setChosen(null)}
        title={chosen ? `${chosen.from} → ${chosen.to}` : ""}
      >
        {chosen && (
          <>
            <p>
              {chosen.date} · {chosen.time} · {chosen.car}
            </p>
            <div className="detail-driver">
              <span className={"avatar " + chosen.color}>{chosen.name[0]}</span>
              <div>
                <b>{chosen.name}</b>
                <p>★ {chosen.rating} · Проверенный демо-профиль</p>
              </div>
            </div>
            <p>
              Свободных мест: {chosen.seats} ·{" "}
              <b>{chosen.price.toLocaleString("ru-RU")} ₽ за место</b>
            </p>
            <p className="muted">
              Встреча у центрального вокзала. Небольшой багаж, комфортная
              поездка и остановки по договорённости.
            </p>
            <button className="primary full" onClick={() => s.book(chosen.id)}>
              {s.booked.includes(chosen.id) ? (
                <>
                  <Check size={18} />
                  Место забронировано
                </>
              ) : (
                "Забронировать место (демо)"
              )}
            </button>
            <Link
              to="/chats"
              onClick={() => {
                sessionStorage.setItem(
                  "chat-active",
                  chosen.name === "Мария" ? "1" : "0",
                );
                setChosen(null);
              }}
              className="text-button full"
            >
              Написать водителю
              <MessageCircle size={17} />
            </Link>
          </>
        )}
      </Modal>
    </main>
  );
}
function TripCard({ trip: t, onClick }: { trip: Trip; onClick: () => void }) {
  return (
    <button className="trip-card" onClick={onClick}>
      <div className="trip-date">
        <CalendarDays size={12} />
        {new Date(t.date + "T12:00:00").toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
        })}
      </div>
      <div className="trip-top">
        <span>
          {t.time}
          <small>{t.end}</small>
        </span>
        <div className="timeline">
          <i />
          <span />
          <i />
        </div>
        <div className="trip-cities">
          <b>{t.from}</b>
          <b>{t.to}</b>
        </div>
        <strong>
          {t.price.toLocaleString("ru-RU")} ₽<small>за место</small>
        </strong>
      </div>
      <div className="trip-bottom">
        <span className={"avatar " + t.color}>{t.name[0]}</span>
        <div className="driver">
          <b>
            {t.name} <BadgeCheck size={14} />
          </b>
          <span>
            <Star size={12} fill="currentColor" />
            {t.rating}
            <i>·</i>
            {t.car}
          </span>
        </div>
        <span className="seat">
          <Users size={15} />
          {t.seats}
        </span>
      </div>
    </button>
  );
}
function Trips() {
  const s = useStore();
  const [trip, setTrip] = useState<Trip | null>(null);
  const mine = s.trips.filter(
    (t) => t.name === "Вы" || s.booked.includes(t.id),
  );
  return (
    <main className="page">
      <div className="eyebrow">ВАШИ ПЛАНЫ</div>
      <h1>Мои поездки</h1>
      <p className="muted">Опубликованные маршруты и забронированные места</p>
      <div className="trip-grid">
        {mine.map((t) => (
          <TripCard key={t.id} trip={t} onClick={() => setTrip(t)} />
        ))}
      </div>
      {!mine.length && (
        <div className="empty">
          <Car size={40} />
          <h2>Всё начинается с первой поездки</h2>
          <p>Найдите маршрут или создайте поездку кнопкой вверху.</p>
          <Link className="primary" to="/">
            Найти попутчиков
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
      <Modal open={!!trip} onClose={() => setTrip(null)} title="Ваша поездка">
        {trip && (
          <p>
            {trip.from} → {trip.to}
            <br />
            {trip.date} · {trip.time}
            <br />
            {trip.name === "Вы"
              ? "Вы водитель"
              : "Бронирование подтверждено в демо"}
          </p>
        )}
        <Link to="/chats" className="primary">
          Открыть чат
        </Link>
      </Modal>
    </main>
  );
}
function Chats() {
  const s = useStore();
  const geo = useLocationStore();
  const [locationToken, setLocationToken] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [active, setActive] = useState(
    Number(sessionStorage.getItem("chat-active") || 0),
  );
  return (
    <main className="page">
      <h1>Сообщения</h1>
      <p className="muted">Договоритесь о деталях и познакомьтесь до поездки</p>
      <div className="chat-layout">
        <aside>
          {["Александр", "Мария"].map((name, i) => (
            <button
              key={name}
              className={cn("chat-contact", active === i && "selected")}
              onClick={() => setActive(i)}
            >
              <span className={"avatar " + (i ? "pink" : "orange")}>
                {name[0]}
              </span>
              <div>
                <b>{name}</b>
                <small>
                  {i ? "Москва → Казань" : "Москва → Санкт-Петербург"}
                </small>
              </div>
            </button>
          ))}
        </aside>
        <section className="chat">
          <div className="chat-heading">
            <b>{active ? "Мария" : "Александр"}</b>
            <button
              className="request-location"
              onClick={() => setLocationToken(geo.request(active, "Пассажир"))}
            >
              <MapPin size={16} />
              Запросить геолокацию
            </button>
          </div>
          <div className="chat-messages">
            <small className="chat-day">Сегодня</small>
            <p className="bubble">
              Привет! Встречаемся у главного входа на вокзал. Подойдёт?
            </p>
            <LocationChatCard chatId={active} onOpen={setLocationToken} />
            {s.messages
              .filter((m) => m.startsWith(active + ":"))
              .map((m, i) => (
                <p className="bubble own" key={i}>
                  {m.slice(2)}
                </p>
              ))}
          </div>
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              if (msg.trim()) {
                s.send(active + ":" + msg.trim());
                setMsg("");
              }
            }}
          >
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Написать сообщение…"
              aria-label="Сообщение"
            />
            <button className="primary" aria-label="Отправить">
              <Send size={19} />
            </button>
          </form>
        </section>
      </div>
      <Modal
        open={!!locationToken}
        onClose={() => setLocationToken(null)}
        title="Геолокация пассажира"
      >
        {locationToken && <LocationPanel token={locationToken} />}
      </Modal>
    </main>
  );
}
function Profile() {
  const s = useStore();
  const openAuth = useContext(AuthContext);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(
    localStorage.getItem("profile-name") || "Виктор",
  );
  const [email, setEmail] = useState(
    localStorage.getItem("profile-email") || "viktor@example.com",
  );
  const [car, setCar] = useState(
    localStorage.getItem("profile-car") || "Kia K5",
  );
  const [plate, setPlate] = useState(
    localStorage.getItem("profile-plate") || "А 123 АА 77",
  );
  useEffect(() => {
    setName(localStorage.getItem("profile-name") || "Виктор");
    setEmail(localStorage.getItem("profile-email") || "viktor@example.com");
  }, [s.user]);
  if (!s.user)
    return (
      <main className="page">
        <div className="empty">
          <ShieldCheck size={40} />
          <h1>Войдите в аккаунт</h1>
          <p>
            Ваш профиль, отзывы и автомобиль будут доступны после демо-входа.
          </p>
          <button className="primary" onClick={openAuth}>
            Войти в аккаунт
            <ArrowRight size={18} />
          </button>
        </div>
      </main>
    );
  return (
    <main className="page">
      <h1>Мой профиль</h1>
      <p className="muted">Доверие начинается со знакомства</p>
      <div className="profile-grid">
        <section className="panel profile-card">
          <span className="avatar huge blue">{name[0]}</span>
          <h2>{name}</h2>
          <span className="verified">
            <BadgeCheck size={16} />
            Демо-профиль
          </span>
          <div className="ratings">
            <div>
              <b>
                4.9 <Star size={16} />
              </b>
              <small>Как водитель</small>
            </div>
            <div>
              <b>
                5.0 <Star size={16} />
              </b>
              <small>Как пассажир</small>
            </div>
          </div>
          <button className="secondary full" onClick={() => setEdit(true)}>
            Редактировать профиль
          </button>
          <button className="text-button full" onClick={s.logout}>
            Выйти из аккаунта
          </button>
        </section>
        <div>
          <section className="panel">
            <h2>Проверки и контакты</h2>
            <p className="muted">
              Демонстрационные статусы — реальные документы не проверяются.
            </p>
            {[
              "Паспортные данные · демо-проверка",
              "Почта · " + email,
              "Госуслуги · демо-подключение",
              "MAX · демо-подключение",
            ].map((x) => (
              <div className="profile-row" key={x}>
                <ShieldCheck size={20} />
                <span>{x}</span>
                <Check size={18} />
              </div>
            ))}
          </section>
          <section className="panel">
            <h2>Мой автомобиль</h2>
            <div className="profile-row">
              <Car size={28} />
              <div>
                <b>{car} · голубой</b>
                <p className="muted">{plate} · демо-номер</p>
              </div>
              <span className="tag">Комфорт</span>
            </div>
          </section>
          <section className="panel">
            <h2>
              Отзывы <span className="muted">· 2</span>
            </h2>
            {[
              [
                "Мария",
                "Отличная поездка! Аккуратное вождение и приятная беседа.",
              ],
              ["Дмитрий", "Приехали вовремя. Обязательно поеду ещё."],
            ].map(([n, text]) => (
              <div className="review" key={n}>
                <span className="avatar pink">{n[0]}</span>
                <div>
                  <b>{n}</b>
                  <span className="stars"> ★★★★★</span>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
      <Modal
        open={edit}
        onClose={() => setEdit(false)}
        title="Редактировать профиль"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            localStorage.setItem("profile-name", name);
            localStorage.setItem("profile-email", email);
            localStorage.setItem("profile-car", car);
            localStorage.setItem("profile-plate", plate);
            setEdit(false);
          }}
        >
          <label>
            Ваше имя
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Почта
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Автомобиль
            <input
              value={car}
              onChange={(e) => setCar(e.target.value)}
              required
            />
          </label>
          <label>
            Госномер (демо)
            <input
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              required
            />
          </label>
          <button className="primary full">Сохранить</button>
        </form>
      </Modal>
    </main>
  );
}
const rootRoute = createRootRoute({ component: App });
const routes = [
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/location/$token",
    component: SharedLocationPage,
  }),
  createRoute({ getParentRoute: () => rootRoute, path: "/", component: Home }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/trips",
    component: Trips,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/chats",
    component: Chats,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/profile",
    component: Profile,
  }),
];
const router = createRouter({ routeTree: rootRoute.addChildren(routes) });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
