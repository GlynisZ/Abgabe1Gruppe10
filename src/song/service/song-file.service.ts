/*
 * Copyright (C) 2017 - present Alexander, Matthias, Glynis
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

import { FileNotFound, MultipleFiles, SongNotExists } from './errors';
import { closeMongoDBClient, connectMongoDB, saveReadable } from '../../shared';
import { GridFSBucket } from 'mongodb';
import JSON5 from 'json5';
import type { ObjectId } from 'mongodb';
import { Readable } from 'stream';
import { SongModel } from '../entity';
import { logger } from '../../shared';

/* eslint-disable unicorn/no-useless-undefined */
export class SongFileService {
    async save(id: string, buffer: Buffer, contentType: string | undefined) {
        logger.debug(
            `SongFileService.save(): id = ${id}, contentType=${contentType}`,
        );

        // Gibt es ein Song zur angegebenen ID?
        const song = await SongModel.findById(id);
        // eslint-disable-next-line no-null/no-null
        if (song === null) {
            return false;
        }

        const { db, client } = await connectMongoDB();
        const bucket = new GridFSBucket(db);
        await this.deleteFiles(id, bucket);

        // https://stackoverflow.com/questions/13230487/converting-a-buffer-into-a-readablestream-in-node-js#answer-44091532
        const readable = new Readable();
        // _read ist erforderlich, kann die leere Funktion sein
        readable._read = () => {}; // eslint-disable-line no-underscore-dangle,no-empty-function
        readable.push(buffer);
        readable.push(null); // eslint-disable-line no-null/no-null,unicorn/no-null

        const metadata = { contentType };
        saveReadable(readable, bucket, id, { metadata }, client);
        return true;
    }

    async find(filename: string) {
        logger.debug(`SongFileService.findFile(): filename=${filename}`);
        const resultCheck = await this.checkFilename(filename);
        if (resultCheck !== undefined) {
            return resultCheck;
        }

        const { db, client } = await connectMongoDB();

        // https://mongodb.github.io/node-mongodb-native/3.5/tutorials/gridfs/streaming
        const bucket = new GridFSBucket(db);
        const resultContentType = await this.getContentType(filename, bucket);
        if (typeof resultContentType !== 'string') {
            return resultContentType;
        }

        const contentType = resultContentType;
        // https://mongodb.github.io/node-mongodb-native/3.5/tutorials/gridfs/streaming/#downloading-a-file
        // https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93
        const readStream = bucket
            .openDownloadStreamByName(filename)
            .on('end', () => closeMongoDBClient(client));
        return { readStream, contentType };
    }

    private async deleteFiles(filename: string, bucket: GridFSBucket) {
        logger.debug(`SongFileService.deleteFiles(): filename=${filename}`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/naming-convention
        const idObjects: { _id: ObjectId }[] = await bucket
            .find({ filename })
            .project({ _id: 1 }) // eslint-disable-line @typescript-eslint/naming-convention
            .toArray();
        const ids = idObjects.map((obj) => obj._id);
        logger.debug(
            `SongFileService.deleteFiles(): ids=${JSON5.stringify(ids)}`,
        );
        ids.forEach((fileId) =>
            bucket.delete(fileId, () =>
                logger.debug(
                    `SongFileService.deleteFiles(): geloeschte ID=${JSON5.stringify(
                        fileId,
                    )}`,
                ),
            ),
        );
    }

    private async checkFilename(filename: string) {
        logger.debug(`SongFileService.checkFilename(): filename=${filename}`);

        // Gibt es ein Song mit dem gegebenen "filename" als ID?
        const song = await SongModel.findById(filename);
        // eslint-disable-next-line no-null/no-null
        if (song === null) {
            const result = new SongNotExists(filename);
            logger.debug(
                `SongFileService.checkFilename(): SongNotExists=${JSON5.stringify(
                    result,
                )}`,
            );
            return result;
        }

        logger.debug(
            `SongFileService.checkFilename(): song=${JSON5.stringify(song)}`,
        );

        return undefined;
    }

    private async getContentType(filename: string, bucket: GridFSBucket) {
        let files: { metadata: { contentType: string } }[];
        try {
            files = await bucket.find({ filename }).toArray(); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        } catch (err: unknown) {
            logger.error(`${JSON5.stringify(err)}`);
            files = [];
        }

        switch (files.length) {
            case 0: {
                const error = new FileNotFound(filename);
                logger.debug(
                    `SongFileService.getContentType(): FileNotFound=${JSON5.stringify(
                        error,
                    )}`,
                );
                return error;
            }

            case 1: {
                const [file] = files;
                const { contentType }: { contentType: string } = file.metadata;
                logger.debug(
                    `SongFileService.getContentType(): contentType=${contentType}`,
                );
                return contentType;
            }

            default: {
                const error = new MultipleFiles(filename);
                logger.debug(
                    `SongFileService.getContentType(): MultipleFiles=${JSON5.stringify(
                        error,
                    )}`,
                );
                return new MultipleFiles(filename);
            }
        }
    }
}

/* eslint-enable unicorn/no-useless-undefined */
