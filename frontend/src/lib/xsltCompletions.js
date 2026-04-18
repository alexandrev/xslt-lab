/**
 * XSLT/XPath completions data.
 * Each entry: { label, type, info, args, minVersion, blogSlug? }
 *   - minVersion: "1.0" | "2.0" | "3.0"
 *   - blogSlug: used to link to blog.xsltplayground.com/xslt/functions/<slug>
 */

// ─── XSL elements ────────────────────────────────────────────────────────────

export const XSL_ELEMENTS = [
  // 1.0
  { label: "xsl:stylesheet",      minVersion: "1.0", info: "Root element of an XSLT stylesheet",                             args: 'version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"' },
  { label: "xsl:transform",       minVersion: "1.0", info: "Synonym for xsl:stylesheet",                                      args: 'version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"' },
  { label: "xsl:template",        minVersion: "1.0", info: "Defines a reusable template rule",                                args: 'match="/"' },
  { label: "xsl:apply-templates", minVersion: "1.0", info: "Applies templates to child nodes",                                args: 'select="node()"' },
  { label: "xsl:call-template",   minVersion: "1.0", info: "Calls a named template",                                          args: 'name="templateName"' },
  { label: "xsl:value-of",        minVersion: "1.0", info: "Outputs the string value of an XPath expression",                 args: 'select="."',               blogSlug: "xsl-value-of" },
  { label: "xsl:for-each",        minVersion: "1.0", info: "Iterates over a node-set",                                        args: 'select="items/item"',      blogSlug: "xsl-for-each" },
  { label: "xsl:if",              minVersion: "1.0", info: "Conditional output",                                               args: 'test="condition"' },
  { label: "xsl:choose",          minVersion: "1.0", info: "Switch-like conditional block (use with xsl:when / xsl:otherwise)" },
  { label: "xsl:when",            minVersion: "1.0", info: "Condition branch inside xsl:choose",                              args: 'test="condition"' },
  { label: "xsl:otherwise",       minVersion: "1.0", info: "Default branch inside xsl:choose" },
  { label: "xsl:variable",        minVersion: "1.0", info: "Declares a variable",                                             args: 'name="varName" select="."' },
  { label: "xsl:param",           minVersion: "1.0", info: "Declares a parameter (template or stylesheet level)",             args: 'name="paramName"' },
  { label: "xsl:with-param",      minVersion: "1.0", info: "Passes a parameter to a template",                               args: 'name="paramName" select="."' },
  { label: "xsl:sort",            minVersion: "1.0", info: "Sorts nodes inside xsl:for-each or xsl:apply-templates",         args: 'select="." order="ascending"' },
  { label: "xsl:copy",            minVersion: "1.0", info: "Shallow-copies the current node" },
  { label: "xsl:copy-of",         minVersion: "1.0", info: "Deep-copies a node-set or value",                                args: 'select="."' },
  { label: "xsl:text",            minVersion: "1.0", info: "Outputs literal text (preserves whitespace)" },
  { label: "xsl:element",         minVersion: "1.0", info: "Creates an element with a computed name",                         args: 'name="elementName"' },
  { label: "xsl:attribute",       minVersion: "1.0", info: "Creates an attribute on the parent element",                     args: 'name="attrName"' },
  { label: "xsl:attribute-set",   minVersion: "1.0", info: "Defines a named set of attributes",                              args: 'name="setName"' },
  { label: "xsl:comment",         minVersion: "1.0", info: "Outputs an XML comment" },
  { label: "xsl:processing-instruction", minVersion: "1.0", info: "Outputs a processing instruction",                        args: 'name="piName"' },
  { label: "xsl:include",         minVersion: "1.0", info: "Includes another stylesheet",                                     args: 'href="other.xsl"' },
  { label: "xsl:import",          minVersion: "1.0", info: "Imports another stylesheet (lower precedence)",                   args: 'href="other.xsl"' },
  { label: "xsl:output",          minVersion: "1.0", info: "Controls serialization of the result tree",                      args: 'method="xml" indent="yes"' },
  { label: "xsl:preserve-space",  minVersion: "1.0", info: "Preserves whitespace in specified elements",                     args: 'elements="*"' },
  { label: "xsl:strip-space",     minVersion: "1.0", info: "Strips whitespace from specified elements",                      args: 'elements="*"' },
  { label: "xsl:key",             minVersion: "1.0", info: "Defines an index key for the key() function",                   args: 'name="keyName" match="element" use="@id"' },
  { label: "xsl:decimal-format",  minVersion: "1.0", info: "Defines a decimal format for format-number()" },
  { label: "xsl:namespace-alias", minVersion: "1.0", info: "Maps a namespace prefix to another",                             args: 'stylesheet-prefix="xsl" result-prefix="out"' },
  { label: "xsl:number",          minVersion: "1.0", info: "Formats a number or generates a sequence number",                args: 'value="position()"' },
  { label: "xsl:message",         minVersion: "1.0", info: "Emits a diagnostic message (may terminate)",                    args: 'terminate="no"' },
  { label: "xsl:fallback",        minVersion: "1.0", info: "Fallback content for unrecognized extension elements" },
  // 2.0
  { label: "xsl:function",        minVersion: "2.0", info: "Defines a stylesheet function callable from XPath",              args: 'name="my:func" as="xs:string"',  blogSlug: "xsl-function" },
  { label: "xsl:sequence",        minVersion: "2.0", info: "Returns a sequence of items",                                    args: 'select="()"' },
  { label: "xsl:next-match",      minVersion: "2.0", info: "Applies the next-matching template rule" },
  { label: "xsl:perform-sort",    minVersion: "2.0", info: "Sorts a sequence without iteration",                             args: 'select="items"' },
  { label: "xsl:for-each-group",  minVersion: "2.0", info: "Groups items in a sequence",                                    args: 'select="items" group-by="."',    blogSlug: "xsl-for-each-group" },
  { label: "xsl:analyze-string",  minVersion: "2.0", info: "Processes a string against a regex",                            args: 'select="." regex="pattern"' },
  { label: "xsl:matching-substring",    minVersion: "2.0", info: "Content within xsl:analyze-string for matching parts" },
  { label: "xsl:non-matching-substring", minVersion: "2.0", info: "Content within xsl:analyze-string for non-matching parts" },
  { label: "xsl:namespace",       minVersion: "2.0", info: "Creates a namespace node",                                      args: 'name="prefix"' },
  { label: "xsl:character-map",   minVersion: "2.0", info: "Maps characters to strings during serialization",               args: 'name="mapName"' },
  { label: "xsl:output-character", minVersion: "2.0", info: "Maps a single character inside xsl:character-map",            args: 'character="&amp;" string="&amp;amp;"' },
  { label: "xsl:import-schema",   minVersion: "2.0", info: "Imports an XML Schema for type-aware processing",               args: 'namespace="http://example.com"' },
  { label: "xsl:result-document", minVersion: "2.0", info: "Writes output to a secondary result document",                  args: 'href="output.xml" method="xml"' },
  // 3.0
  { label: "xsl:package",         minVersion: "3.0", info: "Defines an XSLT 3.0 package",                                  args: 'name="com.example.pkg" version="1.0"' },
  { label: "xsl:use-package",     minVersion: "3.0", info: "Uses a compiled package",                                       args: 'name="com.example.pkg"' },
  { label: "xsl:expose",          minVersion: "3.0", info: "Controls visibility of components within a package",            args: 'component="function" match="*" visibility="public"' },
  { label: "xsl:override",        minVersion: "3.0", info: "Overrides components from a used package" },
  { label: "xsl:mode",            minVersion: "3.0", info: "Declares a mode and its default behavior",                     args: 'name="modeName" on-no-match="shallow-copy"' },
  { label: "xsl:accept",          minVersion: "3.0", info: "Accepts components from a used package",                       args: 'component="function" match="*" visibility="public"' },
  { label: "xsl:try",             minVersion: "3.0", info: "Attempts an expression; catches errors",                       args: 'select="expression"' },
  { label: "xsl:catch",           minVersion: "3.0", info: "Catches errors from xsl:try" },
  { label: "xsl:on-empty",        minVersion: "3.0", info: "Content to output when the sequence is empty" },
  { label: "xsl:on-non-empty",    minVersion: "3.0", info: "Content to output when the sequence is non-empty" },
  { label: "xsl:where-populated", minVersion: "3.0", info: "Suppresses output if the content would be empty" },
  { label: "xsl:map",             minVersion: "3.0", info: "Creates an XPath 3.1 map",                                    args: '' },
  { label: "xsl:map-entry",       minVersion: "3.0", info: "Creates a key-value entry inside xsl:map",                    args: 'key="." select="."' },
  { label: "xsl:array",           minVersion: "3.0", info: "Creates an XPath 3.1 array" },
  { label: "xsl:array-member",    minVersion: "3.0", info: "Creates a member inside xsl:array",                           args: 'select="."' },
  { label: "xsl:stream",          minVersion: "3.0", info: "Processes a document in streaming mode",                      args: 'href="large.xml"' },
  { label: "xsl:iterate",         minVersion: "3.0", info: "Iterates with carry-over accumulators",                       args: 'select="items"',               blogSlug: "xsl-iterate" },
  { label: "xsl:param",           minVersion: "3.0", info: "Streaming: parameter inside xsl:iterate" }, // duplicate intentional (context differs)
  { label: "xsl:break",           minVersion: "3.0", info: "Exits xsl:iterate early",                                     args: 'select="."' },
  { label: "xsl:next-iteration",  minVersion: "3.0", info: "Continues xsl:iterate with updated parameters" },
  { label: "xsl:fork",            minVersion: "3.0", info: "Processes a sequence in multiple streams simultaneously" },
  { label: "xsl:merge",           minVersion: "3.0", info: "Merges pre-sorted sequences",                                 args: '' },
  { label: "xsl:merge-source",    minVersion: "3.0", info: "Defines one source for xsl:merge",                           args: 'name="src" select="collection()"' },
  { label: "xsl:merge-key",       minVersion: "3.0", info: "Defines the merge key inside xsl:merge-source",              args: 'select="." order="ascending"' },
  { label: "xsl:merge-action",    minVersion: "3.0", info: "Body executed for each group of merged items" },
  { label: "xsl:accumulator",     minVersion: "3.0", info: "Defines a streaming accumulator",                            args: 'name="acc" initial-value="0"' },
  { label: "xsl:accumulator-rule", minVersion: "3.0", info: "Rule inside xsl:accumulator",                              args: 'match="element"' },
  { label: "xsl:use-accumulators", minVersion: "3.0", info: "Declares which accumulators are used in a template" },
];

// ─── XPath functions ─────────────────────────────────────────────────────────

export const XPATH_FUNCTIONS = [
  // 1.0 node-set
  { label: "last()",             minVersion: "1.0", info: "Returns the size of the context node-set",                     blogSlug: "xpath-last" },
  { label: "position()",         minVersion: "1.0", info: "Returns the context position",                                 blogSlug: "xpath-position" },
  { label: "count(node-set)",    minVersion: "1.0", info: "Returns the number of nodes in a node-set",                   blogSlug: "xpath-count" },
  { label: "id(string)",         minVersion: "1.0", info: "Selects elements by their unique ID attribute" },
  { label: "local-name(node?)",  minVersion: "1.0", info: "Returns the local part of a node's name" },
  { label: "namespace-uri(node?)", minVersion: "1.0", info: "Returns the namespace URI of a node" },
  { label: "name(node?)",        minVersion: "1.0", info: "Returns the qualified name of a node" },
  // 1.0 string
  { label: "string(object?)",            minVersion: "1.0", info: "Converts an object to a string" },
  { label: "concat(str, str, ...)",      minVersion: "1.0", info: "Concatenates two or more strings",                    blogSlug: "xpath-concat" },
  { label: "starts-with(str, prefix)",   minVersion: "1.0", info: "Returns true if str starts with prefix" },
  { label: "contains(str, substr)",      minVersion: "1.0", info: "Returns true if str contains substr",                 blogSlug: "xpath-contains" },
  { label: "substring-before(str, sep)", minVersion: "1.0", info: "Returns the part of str before the first sep" },
  { label: "substring-after(str, sep)",  minVersion: "1.0", info: "Returns the part of str after the first sep" },
  { label: "substring(str, start, len?)", minVersion: "1.0", info: "Returns a substring (1-based)",                     blogSlug: "xpath-substring" },
  { label: "string-length(str?)",        minVersion: "1.0", info: "Returns the length of a string" },
  { label: "normalize-space(str?)",      minVersion: "1.0", info: "Strips leading/trailing whitespace and collapses internal whitespace" },
  { label: "translate(str, from, to)",   minVersion: "1.0", info: "Replaces characters in str: each char in from is replaced by the corresponding char in to" },
  // 1.0 boolean
  { label: "boolean(object)",    minVersion: "1.0", info: "Converts an object to boolean" },
  { label: "not(boolean)",       minVersion: "1.0", info: "Returns the boolean negation" },
  { label: "true()",             minVersion: "1.0", info: "Returns true" },
  { label: "false()",            minVersion: "1.0", info: "Returns false" },
  { label: "lang(string)",       minVersion: "1.0", info: "Returns true if the context node's language matches" },
  // 1.0 number
  { label: "number(object?)",    minVersion: "1.0", info: "Converts an object to a number" },
  { label: "sum(node-set)",      minVersion: "1.0", info: "Returns the sum of numeric values in a node-set",             blogSlug: "xpath-sum" },
  { label: "floor(number)",      minVersion: "1.0", info: "Rounds down to the nearest integer" },
  { label: "ceiling(number)",    minVersion: "1.0", info: "Rounds up to the nearest integer" },
  { label: "round(number)",      minVersion: "1.0", info: "Rounds to the nearest integer" },
  // XSLT 1.0 extra
  { label: "key(name, value)",   minVersion: "1.0", info: "Looks up nodes using a key defined with xsl:key",             blogSlug: "xpath-key" },
  { label: "format-number(num, pattern, decimalFormat?)", minVersion: "1.0", info: "Formats a number using a decimal format pattern" },
  { label: "current()",          minVersion: "1.0", info: "Returns the current node (differs from . inside predicates)",  blogSlug: "xpath-current" },
  { label: "document(uri, node?)", minVersion: "1.0", info: "Loads an external XML document" },
  { label: "unparsed-entity-uri(name)", minVersion: "1.0", info: "Returns the URI of an unparsed entity" },
  { label: "generate-id(node?)", minVersion: "1.0", info: "Generates a unique string ID for a node" },
  { label: "system-property(name)", minVersion: "1.0", info: "Returns XSLT system properties (xsl:version, xsl:vendor, ...)" },
  { label: "element-available(name)", minVersion: "1.0", info: "Returns true if the element is available" },
  { label: "function-available(name)", minVersion: "1.0", info: "Returns true if the function is available" },
  // 2.0 string
  { label: "string-join(seq, sep?)",        minVersion: "2.0", info: "Joins a sequence of strings with a separator",     blogSlug: "xpath-string-join" },
  { label: "tokenize(str, pattern)",         minVersion: "2.0", info: "Splits a string by a regex pattern",              blogSlug: "xpath-tokenize" },
  { label: "matches(str, pattern, flags?)",  minVersion: "2.0", info: "Returns true if str matches a regex",             blogSlug: "xpath-matches" },
  { label: "replace(str, pattern, replacement, flags?)", minVersion: "2.0", info: "Replaces regex matches in a string",  blogSlug: "xpath-replace" },
  { label: "upper-case(str)",               minVersion: "2.0", info: "Converts a string to uppercase" },
  { label: "lower-case(str)",               minVersion: "2.0", info: "Converts a string to lowercase" },
  { label: "ends-with(str, suffix)",         minVersion: "2.0", info: "Returns true if str ends with suffix" },
  { label: "codepoints-to-string(seq)",      minVersion: "2.0", info: "Converts Unicode codepoints to a string" },
  { label: "string-to-codepoints(str)",      minVersion: "2.0", info: "Converts a string to a sequence of Unicode codepoints" },
  { label: "compare(str1, str2, collation?)", minVersion: "2.0", info: "Compares two strings, returns -1, 0 or 1" },
  { label: "normalize-unicode(str, form?)",  minVersion: "2.0", info: "Normalizes a string to a Unicode normalization form" },
  // 2.0 sequence
  { label: "empty(seq)",                    minVersion: "2.0", info: "Returns true if the sequence is empty" },
  { label: "exists(seq)",                   minVersion: "2.0", info: "Returns true if the sequence is non-empty" },
  { label: "distinct-values(seq, collation?)", minVersion: "2.0", info: "Returns distinct values from a sequence" },
  { label: "insert-before(seq, pos, ins)",  minVersion: "2.0", info: "Inserts items into a sequence at a position" },
  { label: "remove(seq, pos)",              minVersion: "2.0", info: "Removes an item at a position from a sequence" },
  { label: "reverse(seq)",                  minVersion: "2.0", info: "Reverses a sequence" },
  { label: "subsequence(seq, start, len?)", minVersion: "2.0", info: "Returns a subsequence" },
  { label: "unordered(seq)",                minVersion: "2.0", info: "Returns items in implementation-defined order (hint to optimizer)" },
  { label: "index-of(seq, value, collation?)", minVersion: "2.0", info: "Returns positions of a value in a sequence" },
  { label: "deep-equal(seq1, seq2, collation?)", minVersion: "2.0", info: "Returns true if two sequences are deeply equal" },
  { label: "zero-or-one(seq)",              minVersion: "2.0", info: "Asserts the sequence has 0 or 1 items" },
  { label: "exactly-one(seq)",              minVersion: "2.0", info: "Asserts the sequence has exactly 1 item" },
  { label: "one-or-more(seq)",              minVersion: "2.0", info: "Asserts the sequence has 1 or more items" },
  // 2.0 numeric
  { label: "abs(number)",                   minVersion: "2.0", info: "Returns the absolute value" },
  { label: "min(seq, collation?)",          minVersion: "2.0", info: "Returns the minimum value in a sequence" },
  { label: "max(seq, collation?)",          minVersion: "2.0", info: "Returns the maximum value in a sequence" },
  { label: "avg(seq)",                      minVersion: "2.0", info: "Returns the average of a sequence of numeric values" },
  // 2.0 date/time
  { label: "current-date()",                minVersion: "2.0", info: "Returns today's date as xs:date" },
  { label: "current-time()",                minVersion: "2.0", info: "Returns current time as xs:time" },
  { label: "current-dateTime()",            minVersion: "2.0", info: "Returns current date+time as xs:dateTime" },
  { label: "year-from-date(date)",          minVersion: "2.0", info: "Extracts the year from an xs:date" },
  { label: "month-from-date(date)",         minVersion: "2.0", info: "Extracts the month from an xs:date" },
  { label: "day-from-date(date)",           minVersion: "2.0", info: "Extracts the day from an xs:date" },
  { label: "hours-from-time(time)",         minVersion: "2.0", info: "Extracts hours from xs:time" },
  { label: "minutes-from-time(time)",       minVersion: "2.0", info: "Extracts minutes from xs:time" },
  { label: "seconds-from-time(time)",       minVersion: "2.0", info: "Extracts seconds from xs:time" },
  { label: "format-date(date, picture, lang?, calendar?, place?)", minVersion: "2.0", info: "Formats an xs:date using a picture string",  blogSlug: "xpath-format-date" },
  { label: "format-time(time, picture, lang?, calendar?, place?)", minVersion: "2.0", info: "Formats an xs:time using a picture string" },
  { label: "format-dateTime(dateTime, picture, lang?, calendar?, place?)", minVersion: "2.0", info: "Formats an xs:dateTime using a picture string" },
  // 2.0 node
  { label: "base-uri(node?)",               minVersion: "2.0", info: "Returns the base URI of a node" },
  { label: "document-uri(node?)",           minVersion: "2.0", info: "Returns the URI of a document node" },
  { label: "nilled(node?)",                 minVersion: "2.0", info: "Returns true if a node is nilled" },
  { label: "node-name(node?)",              minVersion: "2.0", info: "Returns the name of a node as xs:QName" },
  // 2.0 QName / misc
  { label: "QName(uri, name)",              minVersion: "2.0", info: "Creates an xs:QName value" },
  { label: "local-name-from-QName(qname)",  minVersion: "2.0", info: "Returns the local part of an xs:QName" },
  { label: "namespace-uri-from-QName(qname)", minVersion: "2.0", info: "Returns the namespace URI of an xs:QName" },
  { label: "prefix-from-QName(qname)",      minVersion: "2.0", info: "Returns the prefix of an xs:QName" },
  { label: "resolve-QName(str, element)",   minVersion: "2.0", info: "Resolves a lexical QName using in-scope namespaces" },
  { label: "error(qname?, desc?, obj?)",    minVersion: "2.0", info: "Raises an error" },
  { label: "trace(value, label?)",          minVersion: "2.0", info: "Emits a trace message and returns the value unchanged" },
  { label: "static-base-uri()",             minVersion: "2.0", info: "Returns the static base URI of the stylesheet" },
  { label: "implicit-timezone()",           minVersion: "2.0", info: "Returns the implicit timezone" },
  // 3.0 functional
  { label: "apply(func, args)",             minVersion: "3.0", info: "Calls a function with an array of arguments" },
  { label: "function-lookup(name, arity)",  minVersion: "3.0", info: "Returns a function by name and arity, or the empty sequence" },
  { label: "function-name(func)",           minVersion: "3.0", info: "Returns the name of a function item" },
  { label: "function-arity(func)",          minVersion: "3.0", info: "Returns the arity of a function item" },
  { label: "for-each(seq, func)",           minVersion: "3.0", info: "Applies a function to each item of a sequence" },
  { label: "filter(seq, func)",             minVersion: "3.0", info: "Filters a sequence by a predicate function" },
  { label: "fold-left(seq, zero, func)",    minVersion: "3.0", info: "Left-fold: accumulates a result over a sequence" },
  { label: "fold-right(seq, zero, func)",   minVersion: "3.0", info: "Right-fold: accumulates a result over a sequence (from the right)" },
  { label: "for-each-pair(seq1, seq2, func)", minVersion: "3.0", info: "Applies a function to pairs of items from two sequences" },
  { label: "sort(seq, collation?, key?)",   minVersion: "3.0", info: "Sorts a sequence (functional alternative to xsl:sort)" },
  { label: "random-number-generator(seed?)", minVersion: "3.0", info: "Returns a random number generator map" },
  // 3.0 map
  { label: "map:merge(maps, options?)",     minVersion: "3.0", info: "Merges multiple maps into one" },
  { label: "map:size(map)",                 minVersion: "3.0", info: "Returns the number of entries in a map" },
  { label: "map:keys(map)",                 minVersion: "3.0", info: "Returns the keys of a map as a sequence" },
  { label: "map:contains(map, key)",        minVersion: "3.0", info: "Returns true if the map contains the key" },
  { label: "map:get(map, key)",             minVersion: "3.0", info: "Returns the value for a key in a map, or the empty sequence" },
  { label: "map:put(map, key, value)",      minVersion: "3.0", info: "Returns a new map with the key-value pair added or updated" },
  { label: "map:remove(map, keys)",         minVersion: "3.0", info: "Returns a new map with specified keys removed" },
  { label: "map:entry(key, value)",         minVersion: "3.0", info: "Creates a singleton map with one key-value entry" },
  // 3.0 array
  { label: "array:size(array)",             minVersion: "3.0", info: "Returns the number of members in an array" },
  { label: "array:get(array, pos)",         minVersion: "3.0", info: "Returns the member at a 1-based position" },
  { label: "array:put(array, pos, val)",    minVersion: "3.0", info: "Returns a new array with a member replaced" },
  { label: "array:append(array, val)",      minVersion: "3.0", info: "Appends a member to an array" },
  { label: "array:head(array)",             minVersion: "3.0", info: "Returns the first member of an array" },
  { label: "array:tail(array)",             minVersion: "3.0", info: "Returns all but the first member of an array" },
  { label: "array:reverse(array)",          minVersion: "3.0", info: "Reverses an array" },
  { label: "array:join(arrays)",            minVersion: "3.0", info: "Concatenates multiple arrays" },
  { label: "array:subarray(array, start, length?)", minVersion: "3.0", info: "Returns a sub-array" },
  { label: "array:remove(array, positions)", minVersion: "3.0", info: "Removes members at specified positions" },
  { label: "array:insert-before(array, pos, members)", minVersion: "3.0", info: "Inserts members before a position" },
  { label: "array:for-each(array, func)",   minVersion: "3.0", info: "Applies a function to each member of an array" },
  { label: "array:filter(array, func)",     minVersion: "3.0", info: "Filters array members by a predicate" },
  { label: "array:fold-left(array, zero, func)", minVersion: "3.0", info: "Left-fold over an array" },
  { label: "array:fold-right(array, zero, func)", minVersion: "3.0", info: "Right-fold over an array" },
  { label: "array:for-each-pair(arr1, arr2, func)", minVersion: "3.0", info: "Applies a function to pairs from two arrays" },
  { label: "array:sort(array, collation?, key?)", minVersion: "3.0", info: "Sorts an array" },
  { label: "array:flatten(items)",          minVersion: "3.0", info: "Recursively flattens arrays to a sequence" },
  // 3.0 misc
  { label: "environment-variable(name)",    minVersion: "3.0", info: "Returns the value of an environment variable (if available)" },
  { label: "available-environment-variables()", minVersion: "3.0", info: "Returns the names of available environment variables" },
  { label: "unparsed-text(uri, encoding?)", minVersion: "2.0", info: "Reads a text file and returns it as a string" },
  { label: "unparsed-text-lines(uri, encoding?)", minVersion: "2.0", info: "Reads a text file and returns lines as a sequence" },
  { label: "unparsed-text-available(uri, encoding?)", minVersion: "2.0", info: "Returns true if unparsed-text() would succeed" },
  { label: "uri-collection(uri?)",          minVersion: "2.0", info: "Returns a sequence of URIs from a collection" },
  { label: "collection(uri?)",              minVersion: "2.0", info: "Returns a sequence of nodes from a collection" },
  { label: "json-doc(uri, options?)",       minVersion: "3.0", info: "Parses a JSON document from a URI into an XDM map/array" },
  { label: "json-to-xml(str, options?)",    minVersion: "3.0", info: "Converts a JSON string to an XML representation" },
  { label: "xml-to-json(node, options?)",   minVersion: "3.0", info: "Converts an XML node to a JSON string" },
  { label: "parse-json(str, options?)",     minVersion: "3.0", info: "Parses a JSON string into an XDM map/array/atomic value" },
  { label: "serialize(node, params?)",      minVersion: "3.0", info: "Serializes a node or sequence to a string" },
  { label: "parse-xml(str)",               minVersion: "2.0", info: "Parses a string as XML and returns a document node" },
  { label: "parse-xml-fragment(str)",       minVersion: "2.0", info: "Parses a well-balanced XML fragment" },
  { label: "has-children(node?)",           minVersion: "3.0", info: "Returns true if the node has child nodes" },
  { label: "innermost(nodes)",              minVersion: "3.0", info: "Returns the nodes that are not ancestors of any other node in the set" },
  { label: "outermost(nodes)",              minVersion: "3.0", info: "Returns the nodes that are not descendants of any other node in the set" },
  { label: "path(node?)",                   minVersion: "3.0", info: "Returns an XPath expression describing the path to the node" },
  { label: "generate-id(node?)",            minVersion: "1.0", info: "Returns a unique string identifier for a node" },
  { label: "accumulator-before(name)",      minVersion: "3.0", info: "Returns the value of an accumulator before processing the current node" },
  { label: "accumulator-after(name)",       minVersion: "3.0", info: "Returns the value of an accumulator after processing the current node" },
  { label: "current-group()",               minVersion: "2.0", info: "Returns the current group within xsl:for-each-group" },
  { label: "current-grouping-key()",        minVersion: "2.0", info: "Returns the grouping key of the current group" },
  { label: "current-merge-group(source?)",  minVersion: "3.0", info: "Returns the current merge group within xsl:merge" },
  { label: "current-merge-key()",           minVersion: "3.0", info: "Returns the current merge key within xsl:merge" },
  { label: "current-output-uri()",          minVersion: "2.0", info: "Returns the URI of the current output document" },
  { label: "regex-group(n)",                minVersion: "2.0", info: "Returns a captured group from xsl:analyze-string" },
  { label: "type-available(type)",          minVersion: "2.0", info: "Returns true if a schema type is available" },
  { label: "copy-of(seq)",                  minVersion: "2.0", info: "Returns a deep copy of a sequence (XQuery/XPath 2.0)" },
  { label: "snapshot(seq)",                 minVersion: "3.0", info: "Returns a snapshot of the sequence (for streaming)" },
];

const VERSION_ORDER = { "1.0": 1, "2.0": 2, "3.0": 3 };

/**
 * Returns completions filtered to the active XSLT version.
 * Items from earlier versions are always included.
 */
export function getCompletions(xsltVersion = "1.0") {
  const maxV = VERSION_ORDER[xsltVersion] ?? 1;

  const elementItems = XSL_ELEMENTS
    .filter((e, i, arr) => {
      // deduplicate by label (keep first occurrence)
      return arr.findIndex((x) => x.label === e.label) === i;
    })
    .filter((e) => (VERSION_ORDER[e.minVersion] ?? 1) <= maxV)
    .map((e) => ({
      label: e.label,
      type: "keyword",
      detail: e.minVersion === "1.0" ? undefined : `XSLT ${e.minVersion}+`,
      info: () => {
        const div = document.createElement("div");
        div.style.maxWidth = "320px";
        div.style.lineHeight = "1.5";
        div.textContent = e.info;
        if (e.args) {
          const pre = document.createElement("pre");
          pre.style.marginTop = "4px";
          pre.style.fontSize = "11px";
          pre.style.color = "#666";
          pre.textContent = `<${e.label} ${e.args}>`;
          div.appendChild(pre);
        }
        if (e.blogSlug) {
          const a = document.createElement("a");
          a.href = `https://blog.xsltplayground.com/xslt/functions/${e.blogSlug}`;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.style.display = "block";
          a.style.marginTop = "6px";
          a.style.fontSize = "11px";
          a.textContent = "Full docs →";
          div.appendChild(a);
        }
        return div;
      },
      boost: 5,
    }));

  const fnItems = XPATH_FUNCTIONS
    .filter((e, i, arr) => arr.findIndex((x) => x.label === e.label) === i)
    .filter((e) => (VERSION_ORDER[e.minVersion] ?? 1) <= maxV)
    .map((e) => ({
      label: e.label,
      type: "function",
      detail: e.minVersion === "1.0" ? undefined : `XPath ${e.minVersion}+`,
      info: () => {
        const div = document.createElement("div");
        div.style.maxWidth = "320px";
        div.style.lineHeight = "1.5";
        div.textContent = e.info;
        if (e.blogSlug) {
          const a = document.createElement("a");
          a.href = `https://blog.xsltplayground.com/xslt/functions/${e.blogSlug}`;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.style.display = "block";
          a.style.marginTop = "6px";
          a.style.fontSize = "11px";
          a.textContent = "Full docs →";
          div.appendChild(a);
        }
        return div;
      },
      boost: 0,
    }));

  return [...elementItems, ...fnItems];
}
