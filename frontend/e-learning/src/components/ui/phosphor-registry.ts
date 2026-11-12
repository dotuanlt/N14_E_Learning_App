/**
 * Bộ icon Phosphor dùng trong app. Import từng icon qua đường dẫn con (đã được package export) để bundle
 * chỉ chứa các icon thật sự dùng, thay vì toàn bộ ~1.500 icon.
 * Thêm icon mới: import ở đây + thêm một dòng vào REGISTRY.
 */
import type { Icon as PhosphorIcon } from 'phosphor-react-native';

/* eslint-disable @typescript-eslint/no-require-imports */
const ArrowRight = require('phosphor-react-native/src/icons/ArrowRight').ArrowRight as PhosphorIcon;
const ArrowUp = require('phosphor-react-native/src/icons/ArrowUp').ArrowUp as PhosphorIcon;
const ArrowUpRight = require('phosphor-react-native/src/icons/ArrowUpRight').ArrowUpRight as PhosphorIcon;
const Bank = require('phosphor-react-native/src/icons/Bank').Bank as PhosphorIcon;
const Bell = require('phosphor-react-native/src/icons/Bell').Bell as PhosphorIcon;
const BookOpenText = require('phosphor-react-native/src/icons/BookOpenText').BookOpenText as PhosphorIcon;
const BookmarkSimple = require('phosphor-react-native/src/icons/BookmarkSimple').BookmarkSimple as PhosphorIcon;
const Briefcase = require('phosphor-react-native/src/icons/Briefcase').Briefcase as PhosphorIcon;
const Camera = require('phosphor-react-native/src/icons/Camera').Camera as PhosphorIcon;
const CaretDown = require('phosphor-react-native/src/icons/CaretDown').CaretDown as PhosphorIcon;
const CaretLeft = require('phosphor-react-native/src/icons/CaretLeft').CaretLeft as PhosphorIcon;
const CaretRight = require('phosphor-react-native/src/icons/CaretRight').CaretRight as PhosphorIcon;
const Certificate = require('phosphor-react-native/src/icons/Certificate').Certificate as PhosphorIcon;
const ChalkboardTeacher = require('phosphor-react-native/src/icons/ChalkboardTeacher').ChalkboardTeacher as PhosphorIcon;
const ChatCircleDots = require('phosphor-react-native/src/icons/ChatCircleDots').ChatCircleDots as PhosphorIcon;
const Check = require('phosphor-react-native/src/icons/Check').Check as PhosphorIcon;
const CheckCircle = require('phosphor-react-native/src/icons/CheckCircle').CheckCircle as PhosphorIcon;
const Clock = require('phosphor-react-native/src/icons/Clock').Clock as PhosphorIcon;
const Code = require('phosphor-react-native/src/icons/Code').Code as PhosphorIcon;
const CreditCard = require('phosphor-react-native/src/icons/CreditCard').CreditCard as PhosphorIcon;
const DeviceMobile = require('phosphor-react-native/src/icons/DeviceMobile').DeviceMobile as PhosphorIcon;
const DownloadSimple = require('phosphor-react-native/src/icons/DownloadSimple').DownloadSimple as PhosphorIcon;
const Envelope = require('phosphor-react-native/src/icons/Envelope').Envelope as PhosphorIcon;
const Eye = require('phosphor-react-native/src/icons/Eye').Eye as PhosphorIcon;
const EyeSlash = require('phosphor-react-native/src/icons/EyeSlash').EyeSlash as PhosphorIcon;
const FileText = require('phosphor-react-native/src/icons/FileText').FileText as PhosphorIcon;
const FilmSlate = require('phosphor-react-native/src/icons/FilmSlate').FilmSlate as PhosphorIcon;
const Fire = require('phosphor-react-native/src/icons/Fire').Fire as PhosphorIcon;
const Gift = require('phosphor-react-native/src/icons/Gift').Gift as PhosphorIcon;
const GearSix = require('phosphor-react-native/src/icons/GearSix').GearSix as PhosphorIcon;
const Globe = require('phosphor-react-native/src/icons/Globe').Globe as PhosphorIcon;
const GraduationCap = require('phosphor-react-native/src/icons/GraduationCap').GraduationCap as PhosphorIcon;
const Heart = require('phosphor-react-native/src/icons/Heart').Heart as PhosphorIcon;
const House = require('phosphor-react-native/src/icons/House').House as PhosphorIcon;
const Info = require('phosphor-react-native/src/icons/Info').Info as PhosphorIcon;
const Lightbulb = require('phosphor-react-native/src/icons/Lightbulb').Lightbulb as PhosphorIcon;
const ListBullets = require('phosphor-react-native/src/icons/ListBullets').ListBullets as PhosphorIcon;
const Lock = require('phosphor-react-native/src/icons/Lock').Lock as PhosphorIcon;
const MagnifyingGlass = require('phosphor-react-native/src/icons/MagnifyingGlass').MagnifyingGlass as PhosphorIcon;
const MapPin = require('phosphor-react-native/src/icons/MapPin').MapPin as PhosphorIcon;
const Medal = require('phosphor-react-native/src/icons/Medal').Medal as PhosphorIcon;
const Minus = require('phosphor-react-native/src/icons/Minus').Minus as PhosphorIcon;
const Money = require('phosphor-react-native/src/icons/Money').Money as PhosphorIcon;
const PaintBrush = require('phosphor-react-native/src/icons/PaintBrush').PaintBrush as PhosphorIcon;
const PaperPlaneRight = require('phosphor-react-native/src/icons/PaperPlaneRight').PaperPlaneRight as PhosphorIcon;
const PencilSimple = require('phosphor-react-native/src/icons/PencilSimple').PencilSimple as PhosphorIcon;
const PenNib = require('phosphor-react-native/src/icons/PenNib').PenNib as PhosphorIcon;
const Phone = require('phosphor-react-native/src/icons/Phone').Phone as PhosphorIcon;
const Play = require('phosphor-react-native/src/icons/Play').Play as PhosphorIcon;
const PlayCircle = require('phosphor-react-native/src/icons/PlayCircle').PlayCircle as PhosphorIcon;
const Plus = require('phosphor-react-native/src/icons/Plus').Plus as PhosphorIcon;
const Question = require('phosphor-react-native/src/icons/Question').Question as PhosphorIcon;
const Receipt = require('phosphor-react-native/src/icons/Receipt').Receipt as PhosphorIcon;
const Robot = require('phosphor-react-native/src/icons/Robot').Robot as PhosphorIcon;
const Rocket = require('phosphor-react-native/src/icons/Rocket').Rocket as PhosphorIcon;
const SealCheck = require('phosphor-react-native/src/icons/SealCheck').SealCheck as PhosphorIcon;
const ShareNetwork = require('phosphor-react-native/src/icons/ShareNetwork').ShareNetwork as PhosphorIcon;
const ShieldCheck = require('phosphor-react-native/src/icons/ShieldCheck').ShieldCheck as PhosphorIcon;
const ShoppingCartSimple = require('phosphor-react-native/src/icons/ShoppingCartSimple').ShoppingCartSimple as PhosphorIcon;
const SignOut = require('phosphor-react-native/src/icons/SignOut').SignOut as PhosphorIcon;
const SlidersHorizontal = require('phosphor-react-native/src/icons/SlidersHorizontal').SlidersHorizontal as PhosphorIcon;
const Sparkle = require('phosphor-react-native/src/icons/Sparkle').Sparkle as PhosphorIcon;
const SquaresFour = require('phosphor-react-native/src/icons/SquaresFour').SquaresFour as PhosphorIcon;
const Star = require('phosphor-react-native/src/icons/Star').Star as PhosphorIcon;
const Tag = require('phosphor-react-native/src/icons/Tag').Tag as PhosphorIcon;
const ThumbsUp = require('phosphor-react-native/src/icons/ThumbsUp').ThumbsUp as PhosphorIcon;
const Translate = require('phosphor-react-native/src/icons/Translate').Translate as PhosphorIcon;
const Trash = require('phosphor-react-native/src/icons/Trash').Trash as PhosphorIcon;
const Trophy = require('phosphor-react-native/src/icons/Trophy').Trophy as PhosphorIcon;
const UserCircle = require('phosphor-react-native/src/icons/UserCircle').UserCircle as PhosphorIcon;
const UsersThree = require('phosphor-react-native/src/icons/UsersThree').UsersThree as PhosphorIcon;
const VideoCamera = require('phosphor-react-native/src/icons/VideoCamera').VideoCamera as PhosphorIcon;
const Wallet = require('phosphor-react-native/src/icons/Wallet').Wallet as PhosphorIcon;
const Warning = require('phosphor-react-native/src/icons/Warning').Warning as PhosphorIcon;
const X = require('phosphor-react-native/src/icons/X').X as PhosphorIcon;

export const REGISTRY = {
  home: House,
  search: MagnifyingGlass,
  courses: BookOpenText,
  profile: UserCircle,
  cart: ShoppingCartSimple,
  bell: Bell,
  bookmark: BookmarkSimple,
  settings: GearSix,
  sparkle: Sparkle,
  robot: Robot,
  chat: ChatCircleDots,
  send: PaperPlaneRight,
  back: CaretLeft,
  forward: CaretRight,
  down: CaretDown,
  close: X,
  filter: SlidersHorizontal,
  star: Star,
  play: Play,
  playCircle: PlayCircle,
  lock: Lock,
  check: Check,
  checkCircle: CheckCircle,
  clock: Clock,
  users: UsersThree,
  certificate: Certificate,
  heart: Heart,
  like: ThumbsUp,
  eye: Eye,
  eyeOff: EyeSlash,
  mail: Envelope,
  globe: Globe,
  logout: SignOut,
  trash: Trash,
  edit: PencilSimple,
  plus: Plus,
  minus: Minus,
  tag: Tag,
  card: CreditCard,
  wallet: Wallet,
  bank: Bank,
  phone: Phone,
  mobile: DeviceMobile,
  money: Money,
  receipt: Receipt,
  download: DownloadSimple,
  trophy: Trophy,
  medal: Medal,
  fire: Fire,
  gift: Gift,
  info: Info,
  warning: Warning,
  help: Question,
  video: VideoCamera,
  file: FileText,
  share: ShareNetwork,
  graduation: GraduationCap,
  teacher: ChalkboardTeacher,
  code: Code,
  design: PaintBrush,
  business: Briefcase,
  language: Translate,
  writing: PenNib,
  film: FilmSlate,
  camera: Camera,
  rocket: Rocket,
  idea: Lightbulb,
  pin: MapPin,
  list: ListBullets,
  grid: SquaresFour,
  verified: SealCheck,
  shield: ShieldCheck,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  arrowUpRight: ArrowUpRight,
} satisfies Record<string, PhosphorIcon>;

export type IconName = keyof typeof REGISTRY;

/** Tên SF Symbols cũ (iOS) -> tên mới. */
export const SF_ALIAS: Record<string, IconName> = {
  'house.fill': 'home',
  magnifyingglass: 'search',
  'book.fill': 'courses',
  'person.fill': 'profile',
  'cart.fill': 'cart',
  'bell.fill': 'bell',
  'bookmark.fill': 'bookmark',
  'gearshape.fill': 'settings',
  'slider.horizontal.3': 'filter',
  sparkles: 'sparkle',
  'briefcase.fill': 'business',
  'paintbrush.fill': 'design',
  'chevron.left.slash.chevron.right': 'code',
  pencil: 'writing',
  film: 'film',
  globe: 'language',
};

/** Emoji / ký tự cũ -> tên mới (phòng khi còn sót chỗ truyền emoji). */
export const GLYPH_ALIAS: Record<string, IconName> = {
  '🏠': 'home', '🔍': 'search', '📚': 'courses', '👤': 'profile', '🛒': 'cart', '🔔': 'bell', '🔖': 'bookmark',
  '⚙️': 'settings', '🤖': 'sparkle', '💼': 'business', '🎨': 'design', '💻': 'code', '✏️': 'writing', '✍️': 'writing',
  '🎬': 'film', '🌐': 'language', '💳': 'card', '📱': 'mobile', '💰': 'money', '🎓': 'graduation', '📍': 'pin',
  '☰': 'filter', '✓': 'check', '★': 'star', '‹': 'back', '›': 'forward', '✕': 'close', '♡': 'heart', '▶': 'play',
  '↑': 'arrowUp', '↗': 'share', '🔒': 'lock', '➤': 'send',
};
