import validateJs from './js/index.js';
import validateHtml from './html/index.js';
import { getLocator } from 'locate-character';
import getCodeFrame from '../utils/getCodeFrame.js';

export default function validate ( parsed, source, { onerror, onwarn, filename } ) {
	const locator = getLocator( source );

	const validator = {
		error: ( message, pos ) => {
			const { line, column } = locator( pos );

			const error = new Error( message );
			error.frame = getCodeFrame( source, line, column );
			error.loc = { line: line + 1, column };
			error.pos = pos;
			error.filename = filename;

			error.toString = () => `${error.message} (${error.loc.line}:${error.loc.column})\n${error.frame}`;

			if ( onerror ) {
				onerror( error );
			} else {
				throw error;
			}
		},

		warn: ( message, pos ) => {
			const { line, column } = locator( pos );

			const frame = getCodeFrame( source, line, column );

			onwarn({
				message,
				frame,
				loc: { line: line + 1, column },
				pos,
				filename,
				toString: () => `${message} (${line + 1}:${column})\n${frame}`
			});
		},

		templateProperties: {},

		names: [],

		namespace: null
	};

	if ( parsed.js ) {
		validateJs( validator, parsed.js );
	}

	if ( parsed.html ) {
		validateHtml( validator, parsed.html );
	}

	return {
		names: validator.names
	};
}
