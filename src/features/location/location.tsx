import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Link, useParams } from "@tanstack/react-router";
import {
  Car,
  Check,
  Copy,
  ExternalLink,
  MapPin,
  Navigation,
  ShieldCheck,
  Square,
  Clock,
} from "lucide-react";

type LocationShare = {
  token: string;
  chatId: number;
  passenger: string;
  status: "pending" | "active" | "stopped";
  createdAt: number;
  expiresAt: number;
  sharedAt?: number;
};
type LocationState = {
  shares: LocationShare[];
  request: (chatId: number, passenger: string) => string;
  accept: (token: string) => void;
  stop: (token: string) => void;
};
export const useLocationStore = create(
  persist<LocationState>(
    (set, get) => ({
      shares: [],
      request: (chatId, passenger) => {
        const current = get().shares.find(
          (s) =>
            s.chatId === chatId &&
            s.status !== "stopped" &&
            s.expiresAt > Date.now(),
        );
        if (current) return current.token;
        const token = crypto.randomUUID();
        set((s) => ({
          shares: [
            ...s.shares,
            {
              token,
              chatId,
              passenger,
              status: "pending",
              createdAt: Date.now(),
              expiresAt: Date.now() + 60 * 60 * 1000,
            },
          ],
        }));
        return token;
      },
      accept: (token) =>
        set((s) => ({
          shares: s.shares.map((item) =>
            item.token === token &&
            item.status === "pending" &&
            item.expiresAt > Date.now()
              ? { ...item, status: "active", sharedAt: Date.now() }
              : item,
          ),
        })),
      stop: (token) =>
        set((s) => ({
          shares: s.shares.map((item) =>
            item.token === token ? { ...item, status: "stopped" } : item,
          ),
        })),
    }),
    { name: "poputi-location-demo" },
  ),
);

// Keep recipient tabs in sync when the demo passenger stops sharing.
window.addEventListener("storage", (event) => {
  if (event.key === "poputi-location-demo" || event.key === null) {
    void useLocationStore.persist.rehydrate();
  }
});

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const refresh = () => setNow(Date.now());
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return now;
}
function shareStatus(share: LocationShare, now: number) {
  return share.expiresAt <= now ? "expired" : share.status;
}
const statusLabels = {
  pending: "Ожидаем согласия пассажира",
  active: "Демо-геолокация доступна",
  stopped: "Передача остановлена",
  expired: "Срок ссылки истёк",
};
export function LocationMap() {
  return (
    <div
      className="location-map"
      role="img"
      aria-label="Схема с демонстрационной позицией пассажира у Белорусского вокзала в Москве"
    >
      <div className="map-park park-one" />
      <div className="map-park park-two" />
      <div className="map-road road-one" />
      <div className="map-road road-two" />
      <div className="map-road road-three" />
      <span className="map-street">Лесная улица</span>
      <span className="map-street street-two">Тверская улица</span>
      <span className="map-station">
        <Car size={16} />
        Белорусский вокзал
      </span>
      <span className="map-position">
        <Navigation size={23} fill="currentColor" />
      </span>
      <span className="map-position-label">Пассажир · демо</span>
      <span className="map-demo-label">СХЕМА · МОКОВЫЕ ДАННЫЕ</span>
    </div>
  );
}

export function LocationPanel({
  token,
  controls = true,
}: {
  token: string;
  controls?: boolean;
}) {
  const store = useLocationStore();
  const now = useNow();
  const share = store.shares.find((s) => s.token === token);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  if (!share)
    return (
      <div className="location-empty">
        <MapPin size={32} />
        <h2>Ссылка недоступна</h2>
        <p>
          В этом браузере нет такой демо-сессии. MVP хранит запросы локально:
          ссылка пока работает только в браузере, где её создали.
        </p>
        <Link className="primary" to="/chats">
          Вернуться в чаты
        </Link>
      </div>
    );
  const status = shareStatus(share, now);
  const url = `${window.location.origin}/location/${share.token}`;
  const remaining = Math.max(0, Math.ceil((share.expiresAt - now) / 60000));
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  return (
    <div className="location-panel">
      <div className={"location-status " + status}>
        <span />
        {statusLabels[status]}
      </div>
      <p className="location-explanation">
        {status === "pending"
          ? "Сначала пассажир должен разрешить передачу местоположения. До подтверждения по ссылке не показываются координаты."
          : status === "active"
            ? "Поделитесь ссылкой с близкими — они смогут увидеть демонстрационную позицию пассажира."
            : "Местоположение больше не отображается. Чтобы поделиться снова, создайте новый запрос в чате."}
      </p>
      {status === "active" && (
        <>
          <LocationMap />
          <div className="location-meta">
            <span>
              <MapPin size={15} />
              Москва · 55.7750, 37.5820
            </span>
            <span>
              <Clock size={15} />
              Доступ ещё {remaining} мин.
            </span>
          </div>
          <p className="location-footnote">
            Это фиксированная моковая позиция, а не GPS и не отслеживание в
            реальном времени.
          </p>
        </>
      )}
      {controls && status === "pending" && (
        <div className="location-consent">
          <ShieldCheck size={23} />
          <div>
            <b>Демо со стороны пассажира</b>
            <p>
              Нажимая кнопку, пассажир разрешает показывать свою позицию всем, у
              кого есть ссылка, до конца её срока или остановки передачи.
            </p>
            <button className="primary" onClick={() => store.accept(token)}>
              Разрешить передачу (демо)
            </button>
          </div>
        </div>
      )}
      {(status === "active" || status === "pending") && (
        <>
          <label className="location-link-label">
            Ссылка для близких
            <input
              className="location-link-input"
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Ссылка на геолокацию"
            />
          </label>
          <div className="location-share-actions">
            <button className="primary" onClick={copy}>
              {copied ? <Check size={17} /> : <Copy size={17} />}{" "}
              {copied ? "Ссылка скопирована" : "Скопировать ссылку"}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="secondary"
              aria-label="Открыть ссылку на геолокацию"
            >
              <ExternalLink size={18} />
            </a>
          </div>
          {copyError && (
            <p className="location-footnote" role="status">
              Не удалось скопировать автоматически. Выделите ссылку в поле и
              скопируйте вручную.
            </p>
          )}
          {controls && (
            <button className="location-stop" onClick={() => store.stop(token)}>
              <Square size={13} />
              {status === "pending" ? "Отменить запрос" : "Остановить передачу"}
            </button>
          )}
        </>
      )}
      <div className="location-privacy">
        <ShieldCheck size={17} />
        <span>
          Ссылка действует 1 час с момента запроса. Пассажир может остановить
          передачу в любой момент.
        </span>
      </div>
      <p className="location-footnote">
        Учебный MVP: ссылка работает в этом браузере. Для доступа с телефона
        родителя нужны сервер и реальная передача GPS с согласия пассажира.
      </p>
    </div>
  );
}
export function SharedLocationPage() {
  const { token } = useParams({ strict: false });
  return (
    <main className="page location-page">
      <div className="eyebrow">НА СВЯЗИ С БЛИЗКИМИ</div>
      <h1>Где пассажир?</h1>
      <p className="muted">Демонстрационная геолокация поездки</p>
      <section className="panel">
        <LocationPanel token={token || ""} controls={false} />
      </section>
    </main>
  );
}

export function LocationChatCard({
  chatId,
  onOpen,
}: {
  chatId: number;
  onOpen: (token: string) => void;
}) {
  const { shares } = useLocationStore();
  const now = useNow();
  const share = [...shares].reverse().find((s) => s.chatId === chatId);
  if (!share) return null;
  const status = shareStatus(share, now);
  return (
    <button className="location-chat-card" onClick={() => onOpen(share.token)}>
      <span className="location-card-icon">
        <MapPin size={21} />
      </span>
      <div>
        <b>Запрос геолокации</b>
        <span>{statusLabels[status]}</span>
      </div>
      <span className="location-card-arrow">→</span>
    </button>
  );
}
