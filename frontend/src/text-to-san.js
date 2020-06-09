import peg from 'pegjs';

/**
 * A grammar for parsing long-form text descriptions of chess moves. Google
 * Chrome's implementation of the SpeechRecognition API doesn't yet support
 * custom grammars, so we parse the text output ourselves and convert it into
 * chess standard algebraic notation.
 */
const grammar = `
    start
        = move

    move
        = // e.g. "bishop d6 check"
          parts:(
              (piece_move / pawn_move / castle) whitespace (checkmate / check)
          )
          { return parts.join(''); }
          /

          // e.g. "Knight to c7"
          (piece_move / pawn_move / castle)
          /

          // e.g. "White resigns"
          resign

    piece_move
        = parts:(
              // e.g. "knight A takes B4"
              piece whitespace departure whitespace action whitespace destination /

              // e.g. "Rook 2 c7"
              piece whitespace departure whitespace destination /

              // e.g. "Queen to H6"
              piece whitespace action whitespace destination /

              // e.g. "king e3"
              piece whitespace destination
          )
          { return parts.join(''); }

    pawn_move
        = // e.g. "a captures b5 en passant"
          en_passant /

          // e.g. "F captures E8 promote to knight"
          parts:(pawn_capture whitespace pawn_promotion)
          { return parts.join(''); }
          /

          // e.g. "c8 promote to Queen"
          parts:(destination whitespace pawn_promotion)
          { return parts.join(''); }
          /

          // e.g. "F takes G3"
          pawn_capture /

          // e.g. "c6"
          destination

    /**
     * In en passant, the move is written as if the captured pawn had only moved
     * one square rather than two. For example, if white's g2 pawn moves to g4
     * and is captured en passant by black's f4 pawn, the move is written as
     * fxg3
     */
    en_passant
        = parts:(
              file
              whitespace
              capture
          )
          whitespace
          dest_file:file
          dest_rank:rank
          whitespace
          'en passant'i
          {
              let final_rank;

              switch (dest_rank) {
                  case '4':           // black capturing white
                      final_rank = 3;
                      break;
                  case '5':           // white capturing black
                      final_rank = 4;
                      break;
                  default:
                      throw new Error('Invalid en passant capture');
              }

              return parts.join('') + dest_file + final_rank;
          }

    pawn_capture
        = parts:(file whitespace capture whitespace destination)
          { return parts.join(''); }

    pawn_promotion
        = 'promote to'i whitespace piece:piece { return '=' + piece; }

    check
        = 'check'i { return '+'; }

    checkmate
        = ('checkmate'i / 'mate'i) { return '#'; }

    castle
        = 'castle'i whitespace side:('kingside'i / 'queenside'i)
          { return /king/i.test(side) ? 'O-O' : 'O-O-O'; }

    resign
        = player:('black'i / 'white'i) whitespace 'resigns'i
          { return /black/i.test(player) ? '1-0' : '0-1'; }

    whitespace
        = ' '* { return ''; }

    action
        = capture / to

    to
        = ('moves to'i / 'move to'i / 'to'i) { return ''; }

    capture
        = ('captures'i / 'capture'i / 'takes'i / 'take'i) { return 'x'; }

    departure
        = square / file / rank

    destination
        = square

    square
        = coordinates:(file rank) { return coordinates.join(''); }

    rank
        = [1-8]

    file
        = letter:[a-h]i { return letter.toLowerCase(); }

    piece
        = king / queen / rook / bishop / knight

    king
        = 'king'i { return 'K'; }

    queen
        = 'queen'i { return 'Q'; }

    rook
        = 'rook'i { return 'R'; }

    bishop
        = 'bishop'i { return 'B'; }

    knight
        = 'knight'i { return 'N'; }
`;

const parser = peg.generate(grammar);

/**
 * Convert long-form text to chess standard algebraic notation (SAN).
 *
 * Examples:
 *
 *     c6                       -> c6
 *     f captures g4 en passant -> fxg3
 *     bishop a takes e4        -> Baxe4
 *     castle queenside         -> O-O-O
 *     white resigns            -> 0-1
 */
const textToSAN = (text) => {
    return parser.parse(text);
};

export default textToSAN;
