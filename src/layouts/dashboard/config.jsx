import ChartPieIcon from "@heroicons/react/24/solid/ChartPieIcon"
import CogIcon from "@heroicons/react/24/solid/CogIcon"
import ShoppingCartIcon from "@heroicons/react/24/solid/ShoppingCartIcon"
import UsersIcon from "@heroicons/react/24/solid/UsersIcon"
import CubeIcon from "@heroicons/react/24/solid/CubeIcon"
import NewspaperIcon from "@heroicons/react/24/solid/NewspaperIcon"
import ChatBubbleLeftRightIcon from "@heroicons/react/24/solid/ChatBubbleLeftRightIcon"
import RectangleStackIcon from "@heroicons/react/24/solid/RectangleStackIcon"
import TagIcon from "@heroicons/react/24/solid/TagIcon"
import PhotoIcon from "@heroicons/react/24/solid/PhotoIcon"
import StarIcon from "@heroicons/react/24/solid/StarIcon"
import BuildingStorefrontIcon from "@heroicons/react/24/solid/BuildingStorefrontIcon"
import TicketIcon from "@heroicons/react/24/solid/TicketIcon"
import QueueListIcon from "@heroicons/react/24/solid/QueueListIcon"
import { SvgIcon } from '@mui/material';

const icon = (Component) => (
  <SvgIcon>
    <Component />
  </SvgIcon>
);

export const items = [
  { href: '/', icon: icon(ChartPieIcon), label: 'Home' },
  { href: '/orders', icon: icon(ShoppingCartIcon), label: 'Orders' },
  { href: '/order-statuses', icon: icon(QueueListIcon), label: 'Order Statuses' },
  { href: '/users', icon: icon(UsersIcon), label: 'Users' },
  { href: '/products', icon: icon(CubeIcon), label: 'Products' },
  { href: '/categories', icon: icon(RectangleStackIcon), label: 'Categories' },
  { href: '/offers', icon: icon(TagIcon), label: 'Offers' },
  { href: '/banners', icon: icon(PhotoIcon), label: 'Banners' },
  { href: '/blog', icon: icon(NewspaperIcon), label: 'Blog' },
  { href: '/reviews', icon: icon(StarIcon), label: 'Reviews' },
  { href: '/testimonials', icon: icon(ChatBubbleLeftRightIcon), label: 'Testimonials' },
  { href: '/stores', icon: icon(BuildingStorefrontIcon), label: 'Stores' },
  { href: '/coupons', icon: icon(TicketIcon), label: 'Coupons' },
  { href: '/settings', icon: icon(CogIcon), label: 'Settings' }
];
