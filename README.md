# speech-to-chess

Play chess with voice commands.

speech-to-chess is a web app for playing chess with voice commands. Currently,
it only supports human vs. human play with both players using the same browser
(i.e. both players must be in the same room using the same computer). In the
future it will support play over the internet.

Try it out at https://speech-to-chess.com! _(Requires Chrome browser.)_

Table of Contents
=================

   * [Requirements](#requirements)
   * [How to play](#how-to-play)
   * [Supported voice commands](#supported-voice-commands)
      * [Note about file names](#note-about-file-names)
      * [Moving](#moving)
         * [Pawns](#pawns)
         * [Pieces](#pieces)
      * [Capturing](#capturing)
         * [Pawns](#pawns-1)
         * [Pieces](#pieces-1)
      * [Check and checkmate](#check-and-checkmate)
      * [Castling](#castling)
      * [Pawn promotions](#pawn-promotions)
      * [En passant](#en-passant)
      * [Undoing moves](#undoing-moves)
      * [Starting a new game](#starting-a-new-game)
      * [Ending a game](#ending-a-game)
   * [Future plans](#future-plans)
   * [License](#license)

## Requirements

speech-to-chess currently only works in Google Chrome (on desktop and Android).
Support for other browsers will be added in future releases.

speech-to-chess only works when you have an active internet connection. If you
are giving voice commands but getting no response, it may be that your internet
connection is down or the quality is poor.

## How to play

To make a move, click the button labelled "Click to give voice command" and say
your move out loud into your computer's microphone. See [supported voice
commands](#supported-voice-commands) for a list of commands you can give. You
have five seconds to give a command after clicking the button.

After each move, the board will update to show the new position. The move that
was just made will be displayed on screen and simultaneously announced out loud.
A list of all moves made so far will also be displayed. When the game ends due
to checkmate, stalemate, threefold repetition, or insufficient material, a
message will be displayed on screen and announced out loud.

The first time you play on speech-to-chess.com, you will be prompted to give
access to your microphone. If you deny access, the game will not work.

## Supported voice commands

speech-to-chess supports three types of command:

1. Valid chess moves
2. Undo
3. Reset

Commands for chess moves roughly correspond to [standard algebraic
notation](https://en.wikipedia.org/wiki/Algebraic_notation_(chess)). For
example, you can make the move "Nf3" by saying "knight f3" or "knight to f3" and
you can make the move "cxd1=Q#" by saying "c takes d1 promote to queen
checkmate."

See below for details on the different types of move commands you can give.

### Note about file names

Google Chrome's speech recognition API frequently misunderstands or ignores the
names of chessboard files ("a" through "h") in speech, so it is recommended that
you use the [NATO phonetic
alphabet](https://en.wikipedia.org/wiki/NATO_phonetic_alphabet) equivalents
("alfa," "bravo," "charlie," "delta," "echo," "foxtrot," "golf," "hotel"). For
example, instead of "knight to f3," you should say "knight to foxtrot 3."
In the future, speech-to-chess will switch to a more accurate speech recognition
implementation to avoid this.

### Moving

#### Pawns

For pawn moves, simply say the destination square the pawn is moving to, e.g.
"e4" or "c1."

#### Pieces

For piece moves, say the name of the piece followed by the destination square,
e.g. "bishop f6" or "queen a3." You can optionally add the word "to" before the
destination square, e.g. "king to g7."

For moves where two pieces of the same type could move to the given destination
square, specify which piece is moving by also giving the name of the file or
rank that the piece is starting from, e.g. "rook a b6," "knight f to g5," or
"rook 7 to h3." If you do not specify the starting rank or file and your move is
ambiguous, it is considered an illegal move.

### Capturing

You can use any of the keywords "take," "takes," "capture," or "captures" to
indicate a capturing move.

#### Pawns

To make a pawn capture another pawn or piece, say the starting file followed by
one of the capturing keywords followed by the destination square, e.g. "f takes
g2" or "a capture b7."

#### Pieces

To make a piece capture another piece or pawn, say the piece followed by one of
the capturing keywords followed by the destination square, e.g. "bishop take e5"
or "king captures h8."

For moves where two pieces of the same type could capture the given destination
square, specify which piece is moving by also giving the name of the file or
rank that the piece is starting from, e.g. "rook c takes b6" or "knight 4
captures g5." If you do not specify the starting rank or file and your move is
ambiguous, it is considered an illegal move.

### Check and checkmate

When a move puts your opponent in check or checkmate, you can optionally say
"check" or "checkmate" at the end of your move, e.g. "bishop to c5 check" or
"queen takes f7 checkmate." This is completely optional; speech-to-chess will
detect if a move results in check or checkmate even if you don't declare it.

If you do want to say "check" or "checkmate," it should be the very last word of
your move, e.g. "d take c8 promote to queen checkmate" or "b captures a4 en
passant check."

### Castling

To castle, say either "castle queenside" or "castle kingside" depending on which
direction you want to castle in.

### Pawn promotions

When you move a pawn onto your opponent's eight rank, you must specify which
piece you would like to promote it to, e.g. "h8 promote to queen" or "b takes c1
promote to knight." If you do not specify the promotion, e.g. "a8" or "e1," your
move is considered illegal.

### En passant

There are two ways to capture en passant:

1. You can treat it like a standard pawn capture where the destination square is
one square behind the pawn being captured, e.g. say "e takes d3" to capture
white's pawn that has just moved from d2 to d4.

2. Instead of saying the square that the capturing pawn will move _to_, you can
say the square that the enemy pawn is _on_ followed by the words "en passant,"
e.g. "f captures g5 en passant."

### Undoing moves

To undo the last move, say "undo."

### Starting a new game

To start a new game, say "reset." This will clear all record of the current
game.

### Ending a game

speech-to-chess will automatically detect game over due to checkmate, stalemate,
and draw because of threefold repetition or insufficient material. When a game
ends for one of these reasons, a message will be displayed on screen and an
audio message will be played.

In the future, support will be added for players to resign or declare a draw.

## Future plans

* Support for more browsers
* More accurate speech recognition engine
* Ability to save games and view/replay them later
* Support for languages other than English
* Ability to play against other people over the internet
* Mobile apps

## License

speech-to-chess is released under the [GPLv3 license](./LICENSE).
