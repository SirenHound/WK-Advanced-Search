# WK-Advanced-Search
Advanced search for Wanikani using its v2 API

# Example Usage

The **NOT** operator
<div>
  <span>:mag: 東 NOT 京</span>
</div>
Just like a search for 東,
except it will not return the following results:

* 東京
* 東京都
* 東京弁

The **CONTAINING** operator
Used with Kanji and Radicals
<div>
  <span>:mag: CONTAINING lion</span>
</div>
Returns all subjects using the Lion radical

The **IN** operator
  <span>:mag: IN 東京</span>
	-> [k"東", k"京"]


CONTAINING 京
IN 日本製
		NOTE finding voc in voc might be slow
	-> [v"日本製",　v"日本", v"日", v"本", k"日", k"本", k"製", r, r, r, r ...]
Kanji IN 東京 CONTAINING ground
Kanji IN 東京 CONTAINING (ground AND sun)
Kanji IN 東京 CONTAINING ground AND sun
Kanji IN 東京 CONTAINING (ground OR sun)
Kanji IN 東京 CONTAINING ground OR sun
Kanji IN 東京 CONTAINING (ground NOT sun)
Kanji IN 東京 CONTAINING ground NOT sun
Vocabulary part_of_speech (CONTAINING) "noun"
Vocabulary part_of_speech (CONTAINING) "adj?ctive"
condition
 -> not 'conditional' etc
condition
