INSERT INTO roles (name) VALUES ('admin'), ('garage_owner'), ('customer') ON CONFLICT (name) DO NOTHING;

INSERT INTO users (id, full_name, email, password_hash, phone, role_id, is_verified, is_active)
SELECT '11111111-1111-1111-1111-111111111111', 'System Admin', 'admin@buaykhor.com', '$2a$10$B0U3.a7lvCDq6VJopYXlNe6j.x2fVY4TiKx73Yd93E4sB2HfF6swu', '+256700000001', id, true, true
FROM roles WHERE name = 'admin';

INSERT INTO users (id, full_name, email, password_hash, phone, role_id, is_verified, is_active)
SELECT '22222222-2222-2222-2222-222222222222', 'Garage Owner', 'owner@garageuganda.com', '$2a$10$uM3hQ2yYFKf2aTuJz7gR6Ot8y3IB7MOPV9O2I0h0l.zm2s4kmGFy2', '+256700000002', id, true, true
FROM roles WHERE name = 'garage_owner';

INSERT INTO users (id, full_name, email, password_hash, phone, role_id, is_verified, is_active)
SELECT '33333333-3333-3333-3333-333333333333', 'Test Customer', 'customer@garageuganda.com', '$2a$10$uM3hQ2yYFKf2aTuJz7gR6Ot8y3IB7MOPV9O2I0h0l.zm2s4kmGFy2', '+256700000003', id, true, true
FROM roles WHERE name = 'customer';

INSERT INTO garages (id, owner_id, name, description, phone, email, address, opening_hours, latitude, longitude, rating, is_approved)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'Kampala Auto Care',
  'Reliable vehicle maintenance and service center in Kampala.',
  '+256772000111',
  'info@kampalaautocare.com',
  'Kampala, Uganda',
  'Mon-Sat 8:00-18:00',
  0.3476,
  32.5825,
  4.8,
  true
);

INSERT INTO services (garage_id, name, description, price, duration_minutes)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'Oil Change', 'Full engine oil change and filter replacement', 120000, 45),
  ('44444444-4444-4444-4444-444444444444', 'Brake Service', 'Brake pad and rotor inspection', 180000, 60),
  ('44444444-4444-4444-4444-444444444444', 'Wheel Alignment', 'Precision wheel alignment', 150000, 60);
