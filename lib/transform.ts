import type { Property as PrismaProperty, Image, Agent as PrismaAgent } from '@prisma/client';
import type { Property, Agent } from './mock-data';

type PropertyFull = PrismaProperty & {
  images: Image[];
  agent: PrismaAgent;
};

export function toProperty(p: PropertyFull): Property {
  let amenities: string[] = [];
  try {
    amenities = JSON.parse(p.amenities);
  } catch {
    amenities = [];
  }

  return {
    id: p.id,
    name: p.name,
    type: p.type as Property['type'],
    location: p.location,
    city: p.city,
    address: p.address,
    price: p.price,
    priceType: p.priceType as Property['priceType'],
    rating: 0,
    reviewCount: 0,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    landArea: p.landArea,
    amenities,
    images: p.images.map((img) => img.url),
    description: p.description,
    agent: toAgent(p.agent),
    featured: p.featured,
    available: p.available,
    yearBuilt: p.yearBuilt,
    parking: p.parking,
    coordinates: { lat: p.latitude, lng: p.longitude },
  };
}

export function toAgent(a: PrismaAgent): Agent {
  return {
    id: a.id,
    name: a.name,
    phone: a.phone,
    email: a.email,
    avatar: a.avatar ?? '',
    rating: a.rating,
    totalListings: a.totalListings,
    experience: a.experience,
    bio: a.bio,
  };
}
