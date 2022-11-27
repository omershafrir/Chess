TIPS & TRICKS

1. when weird undefined behaviour occur -> 1. check for typos!
                                           2. check that everything is normal in the html relevant part e.g.
                                              data-piece, tags and classes in the relevant divs

2. validate rifht behaviour with board numbers/strings -> using the mapping functions correctly!!!!!!

3. in init: constucr 2 arrays of all pieces left to each player
   when a piece gets eaten - remove it from its array => toward end of game : needs to check every possible move of every piece left , if 0 then checkmate 