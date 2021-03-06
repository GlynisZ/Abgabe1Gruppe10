/*
 * Copyright (C) 2018 - present Alexander, Matthias, Glynis
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

/**
 * Typdefinitionen fuer GraphQL:
 *  Vordefinierte skalare Typen
 *      Int: 32‐bit Integer
 *      Float: Gleitkommmazahl mit doppelter Genauigkeit
 *      String:
 *      Boolean: true, false
 *      ID: eindeutiger Bezeichner, wird serialisiert wie ein String
 *  Song: eigene Typdefinition für Queries
 *        "!" markiert Pflichtfelder
 *  Query: Signatur der Lese-Methoden
 *  Mutation: Signatur der Schreib-Methoden
 */

import { gql } from 'apollo-server-express';

// https://www.apollographql.com/docs/apollo-server/migration-two-dot/#the-gql-tag
// https://www.apollographql.com/docs/apollo-server/schema/schema

// "Tagged Template String", d.h. der Template-String wird durch eine Funktion
// (hier: gql) modifiziert. Die Funktion gql wird fuer Syntax-Highlighting und
// fuer die Formatierung durch Prettier verwendet.
export const typeDefs = gql`
    "Enum-Typ fuer das Label eines Songs"
    enum Label {
        SONY_MUSIC
        ROADRUNNER_RECORDS
        BETTERNOISE_MUSIC
        UNIVERSAL_MUSIC
    }

    "Enum-Typ fuer den Interpreten eines Songs"
    enum Interpret {
        TRIVIUM
        FIVEFINGERDEATHPUNCH
        ZUGEZOGENMASKULIN
        DENDEMANN
    }

    "Datenschema eines Songs, das empfangen oder gesendet wird"
    type Song {
        id: ID!
        version: Int
        titel: String!
        label: Label
        produzent: String
        interpret: Interpret
        lauflaenge: Float
        erscheinungsdatum: String
    }

    "Funktionen, um Songs zu empfangen"
    type Query {
        songs(titel: String): [Song]
        song(id: ID!): Song
    }

    "Funktionen, um Songs anzulegen, zu aktualisieren oder zu loeschen"
    type Mutation {
        createSong(
            titel: String!
            label: Label
            produzent: String
            interpret: Interpret
            lauflaenge: Float
            erscheinungsdatum: String
        ): String
        updateSong(
            _id: ID
            titel: String!
            label: Label
            produzent: String
            interpret: Interpret
            lauflaenge: Float
            erscheinungsdatum: String
            version: Int
        ): Song
        deleteSong(id: ID!): Boolean
    }
`;
