/*
 * Copyright (C) 2020 - present Alexander, Matthias, Glynis
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import type { User } from './user.service';
import dotenv from 'dotenv';

dotenv.config();
const { env } = process;
const { USER_PASSWORD_ENCODED } = env;
const password = USER_PASSWORD_ENCODED as string;

// NICHT: Set statt [], weil es fuer Set keine Suchfunktion gibt
export const users: User[] = [
    {
        id: '20000000-0000-0000-0000-000000000001',
        username: 'admin',
        password,
        email: 'admin@acme.com',
        roles: ['admin', 'mitarbeiter', 'kunde'],
    },
    {
        id: '20000000-0000-0000-0000-000000000002',
        username: 'Alex',
        password,
        email: 'alex@acme.com',
        roles: ['admin', 'mitarbeiter'],
    },
    {
        id: '20000000-0000-0000-0000-000000000003',
        username: 'Matthias',
        password,
        email: 'matthias@acme.com',
        roles: ['mitarbeiter', 'kunde'],
    },
    {
        id: '20000000-0000-0000-0000-000000000004',
        username: 'Glynis',
        password,
        email: 'glynis@acme.com',
        roles: ['kunde'],
    },
    {
        id: '20000000-0000-0000-0000-000000000006',
        username: 'Marie',
        password,
        email: 'marie@acme.com',
    },
];
