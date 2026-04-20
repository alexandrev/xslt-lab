/**
 * XSLT/XPath completions data.
 * Each entry: { label, type, info, args, minVersion, blogSlug? }
 *   - minVersion: "1.0" | "2.0" | "3.0"
 *   - blogSlug: used to link to blog.xsltplayground.com/xslt/functions/<slug>
 */

// ─── XSL elements ────────────────────────────────────────────────────────────

export const XSL_ELEMENTS = [
  // 1.0
  { label: "xsl:stylesheet",      minVersion: "1.0", info: "Root element of an XSLT stylesheet",                             args: 'version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"', blogSlug: "xsl-stylesheet" },
  { label: "xsl:transform",       minVersion: "1.0", info: "Synonym for xsl:stylesheet",                                      args: 'version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"', blogSlug: "xsl-transform" },
  { label: "xsl:template",        minVersion: "1.0", info: "Defines a reusable template rule",                                args: 'match="/"', blogSlug: "xsl-template" },
  { label: "xsl:apply-templates", minVersion: "1.0", info: "Applies templates to child nodes",                                args: 'select="node()"', blogSlug: "xsl-apply-templates" },
  { label: "xsl:call-template",   minVersion: "1.0", info: "Calls a named template",                                          args: 'name="templateName"', blogSlug: "xsl-call-template" },
  { label: "xsl:value-of",        minVersion: "1.0", info: "Outputs the string value of an XPath expression",                 args: 'select="."',               blogSlug: "xsl-value-of" },
  { label: "xsl:for-each",        minVersion: "1.0", info: "Iterates over a node-set",                                        args: 'select="items/item"',      blogSlug: "xsl-for-each" },
  { label: "xsl:if",              minVersion: "1.0", info: "Conditional output",                                               args: 'test="condition"', blogSlug: "xsl-if" },
  { label: "xsl:choose",          minVersion: "1.0", info: "Switch-like conditional block (use with xsl:when / xsl:otherwise)", blogSlug: "xsl-choose" },
  { label: "xsl:when",            minVersion: "1.0", info: "Condition branch inside xsl:choose",                              args: 'test="condition"', blogSlug: "xsl-when" },
  { label: "xsl:otherwise",       minVersion: "1.0", info: "Default branch inside xsl:choose", blogSlug: "xsl-otherwise" },
  { label: "xsl:variable",        minVersion: "1.0", info: "Declares a variable",                                             args: 'name="varName" select="."', blogSlug: "xsl-variable" },
  { label: "xsl:param",           minVersion: "1.0", info: "Declares a parameter (template or stylesheet level)",             args: 'name="paramName"', blogSlug: "xsl-param" },
  { label: "xsl:with-param",      minVersion: "1.0", info: "Passes a parameter to a template",                               args: 'name="paramName" select="."', blogSlug: "xsl-with-param" },
  { label: "xsl:sort",            minVersion: "1.0", info: "Sorts nodes inside xsl:for-each or xsl:apply-templates",         args: 'select="." order="ascending"', blogSlug: "xsl-sort" },
  { label: "xsl:copy",            minVersion: "1.0", info: "Shallow-copies the current node", blogSlug: "xsl-copy" },
  { label: "xsl:copy-of",         minVersion: "1.0", info: "Deep-copies a node-set or value",                                args: 'select="."', blogSlug: "xsl-copy-of" },
  { label: "xsl:text",            minVersion: "1.0", info: "Outputs literal text (preserves whitespace)", blogSlug: "xsl-text" },
  { label: "xsl:element",         minVersion: "1.0", info: "Creates an element with a computed name",                         args: 'name="elementName"', blogSlug: "xsl-element" },
  { label: "xsl:attribute",       minVersion: "1.0", info: "Creates an attribute on the parent element",                     args: 'name="attrName"', blogSlug: "xsl-attribute" },
  { label: "xsl:attribute-set",   minVersion: "1.0", info: "Defines a named set of attributes",                              args: 'name="setName"', blogSlug: "xsl-attribute-set" },
  { label: "xsl:comment",         minVersion: "1.0", info: "Outputs an XML comment", blogSlug: "xsl-comment" },
  { label: "xsl:processing-instruction", minVersion: "1.0", info: "Outputs a processing instruction",                        args: 'name="piName"', blogSlug: "xsl-processing-instruction" },
  { label: "xsl:include",         minVersion: "1.0", info: "Includes another stylesheet",                                     args: 'href="other.xsl"', blogSlug: "xsl-include" },
  { label: "xsl:import",          minVersion: "1.0", info: "Imports another stylesheet (lower precedence)",                   args: 'href="other.xsl"', blogSlug: "xsl-import" },
  { label: "xsl:output",          minVersion: "1.0", info: "Controls serialization of the result tree",                      args: 'method="xml" indent="yes"', blogSlug: "xsl-output" },
  { label: "xsl:preserve-space",  minVersion: "1.0", info: "Preserves whitespace in specified elements",                     args: 'elements="*"', blogSlug: "xsl-preserve-space" },
  { label: "xsl:strip-space",     minVersion: "1.0", info: "Strips whitespace from specified elements",                      args: 'elements="*"', blogSlug: "xsl-strip-space" },
  { label: "xsl:key",             minVersion: "1.0", info: "Defines an index key for the key() function",                   args: 'name="keyName" match="element" use="@id"', blogSlug: "xsl-key" },
  { label: "xsl:decimal-format",  minVersion: "1.0", info: "Defines a decimal format for format-number()", blogSlug: "xsl-decimal-format" },
  { label: "xsl:namespace-alias", minVersion: "1.0", info: "Maps a namespace prefix to another",                             args: 'stylesheet-prefix="xsl" result-prefix="out"', blogSlug: "xsl-namespace-alias" },
  { label: "xsl:number",          minVersion: "1.0", info: "Formats a number or generates a sequence number",                args: 'value="position()"', blogSlug: "xsl-number" },
  { label: "xsl:message",         minVersion: "1.0", info: "Emits a diagnostic message (may terminate)",                    args: 'terminate="no"', blogSlug: "xsl-message" },
  { label: "xsl:fallback",        minVersion: "1.0", info: "Fallback content for unrecognized extension elements", blogSlug: "xsl-fallback" },
  // 2.0
  { label: "xsl:function",        minVersion: "2.0", info: "Defines a stylesheet function callable from XPath",              args: 'name="my:func" as="xs:string"',  blogSlug: "xsl-function" },
  { label: "xsl:sequence",        minVersion: "2.0", info: "Returns a sequence of items",                                    args: 'select="()"', blogSlug: "xsl-sequence" },
  { label: "xsl:next-match",      minVersion: "2.0", info: "Applies the next-matching template rule", blogSlug: "xsl-next-match" },
  { label: "xsl:perform-sort",    minVersion: "2.0", info: "Sorts a sequence without iteration",                             args: 'select="items"', blogSlug: "xsl-perform-sort" },
  { label: "xsl:for-each-group",  minVersion: "2.0", info: "Groups items in a sequence",                                    args: 'select="items" group-by="."',    blogSlug: "xsl-for-each-group" },
  { label: "xsl:analyze-string",  minVersion: "2.0", info: "Processes a string against a regex",                            args: 'select="." regex="pattern"', blogSlug: "xsl-analyze-string" },
  { label: "xsl:matching-substring",    minVersion: "2.0", info: "Content within xsl:analyze-string for matching parts", blogSlug: "xsl-matching-substring" },
  { label: "xsl:non-matching-substring", minVersion: "2.0", info: "Content within xsl:analyze-string for non-matching parts", blogSlug: "xsl-non-matching-substring" },
  { label: "xsl:namespace",       minVersion: "2.0", info: "Creates a namespace node",                                      args: 'name="prefix"', blogSlug: "xsl-namespace" },
  { label: "xsl:character-map",   minVersion: "2.0", info: "Maps characters to strings during serialization",               args: 'name="mapName"', blogSlug: "xsl-character-map" },
  { label: "xsl:output-character", minVersion: "2.0", info: "Maps a single character inside xsl:character-map",            args: 'character="&amp;" string="&amp;amp;"', blogSlug: "xsl-output-character" },
  { label: "xsl:import-schema",   minVersion: "2.0", info: "Imports an XML Schema for type-aware processing",               args: 'namespace="http://example.com"', blogSlug: "xsl-import-schema" },
  { label: "xsl:result-document", minVersion: "2.0", info: "Writes output to a secondary result document",                  args: 'href="output.xml" method="xml"', blogSlug: "xsl-result-document" },
  // 3.0
  { label: "xsl:package",         minVersion: "3.0", info: "Defines an XSLT 3.0 package",                                  args: 'name="com.example.pkg" version="1.0"', blogSlug: "xsl-package" },
  { label: "xsl:use-package",     minVersion: "3.0", info: "Uses a compiled package",                                       args: 'name="com.example.pkg"', blogSlug: "xsl-use-package" },
  { label: "xsl:expose",          minVersion: "3.0", info: "Controls visibility of components within a package",            args: 'component="function" match="*" visibility="public"', blogSlug: "xsl-expose" },
  { label: "xsl:override",        minVersion: "3.0", info: "Overrides components from a used package", blogSlug: "xsl-override" },
  { label: "xsl:mode",            minVersion: "3.0", info: "Declares a mode and its default behavior",                     args: 'name="modeName" on-no-match="shallow-copy"', blogSlug: "xsl-mode" },
  { label: "xsl:accept",          minVersion: "3.0", info: "Accepts components from a used package",                       args: 'component="function" match="*" visibility="public"', blogSlug: "xsl-accept" },
  { label: "xsl:try",             minVersion: "3.0", info: "Attempts an expression; catches errors",                       args: 'select="expression"', blogSlug: "xsl-try" },
  { label: "xsl:catch",           minVersion: "3.0", info: "Catches errors from xsl:try", blogSlug: "xsl-catch" },
  { label: "xsl:on-empty",        minVersion: "3.0", info: "Content to output when the sequence is empty", blogSlug: "xsl-on-empty" },
  { label: "xsl:on-non-empty",    minVersion: "3.0", info: "Content to output when the sequence is non-empty", blogSlug: "xsl-on-non-empty" },
  { label: "xsl:where-populated", minVersion: "3.0", info: "Suppresses output if the content would be empty", blogSlug: "xsl-where-populated" },
  { label: "xsl:map",             minVersion: "3.0", info: "Creates an XPath 3.1 map",                                    args: '', blogSlug: "xsl-map" },
  { label: "xsl:map-entry",       minVersion: "3.0", info: "Creates a key-value entry inside xsl:map",                    args: 'key="." select="."', blogSlug: "xsl-map-entry" },
  { label: "xsl:array",           minVersion: "3.0", info: "Creates an XPath 3.1 array", blogSlug: "xsl-array" },
  { label: "xsl:array-member",    minVersion: "3.0", info: "Creates a member inside xsl:array",                           args: 'select="."', blogSlug: "xsl-array-member" },
  { label: "xsl:stream",          minVersion: "3.0", info: "Processes a document in streaming mode",                      args: 'href="large.xml"', blogSlug: "xsl-stream" },
  { label: "xsl:iterate",         minVersion: "3.0", info: "Iterates with carry-over accumulators",                       args: 'select="items"',               blogSlug: "xsl-iterate" },
  { label: "xsl:param",           minVersion: "3.0", info: "Streaming: parameter inside xsl:iterate" }, // duplicate intentional (context differs)
  { label: "xsl:break",           minVersion: "3.0", info: "Exits xsl:iterate early",                                     args: 'select="."', blogSlug: "xsl-break" },
  { label: "xsl:next-iteration",  minVersion: "3.0", info: "Continues xsl:iterate with updated parameters", blogSlug: "xsl-next-iteration" },
  { label: "xsl:fork",            minVersion: "3.0", info: "Processes a sequence in multiple streams simultaneously", blogSlug: "xsl-fork" },
  { label: "xsl:merge",           minVersion: "3.0", info: "Merges pre-sorted sequences",                                 args: '', blogSlug: "xsl-merge" },
  { label: "xsl:merge-source",    minVersion: "3.0", info: "Defines one source for xsl:merge",                           args: 'name="src" select="collection()"', blogSlug: "xsl-merge-source" },
  { label: "xsl:merge-key",       minVersion: "3.0", info: "Defines the merge key inside xsl:merge-source",              args: 'select="." order="ascending"', blogSlug: "xsl-merge-key" },
  { label: "xsl:merge-action",    minVersion: "3.0", info: "Body executed for each group of merged items", blogSlug: "xsl-merge-action" },
  { label: "xsl:accumulator",     minVersion: "3.0", info: "Defines a streaming accumulator",                            args: 'name="acc" initial-value="0"', blogSlug: "xsl-accumulator" },
  { label: "xsl:accumulator-rule", minVersion: "3.0", info: "Rule inside xsl:accumulator",                              args: 'match="element"', blogSlug: "xsl-accumulator-rule" },
  { label: "xsl:use-accumulators", minVersion: "3.0", info: "Declares which accumulators are used in a template", blogSlug: "xsl-use-accumulators" },
];

// ─── XPath functions ─────────────────────────────────────────────────────────

export const XPATH_FUNCTIONS = [
  // 1.0 node-set
  { label: "last()",             minVersion: "1.0", info: "Returns the size of the context node-set",                     blogSlug: "xpath-last" },
  { label: "position()",         minVersion: "1.0", info: "Returns the context position",                                 blogSlug: "xpath-position" },
  { label: "count(node-set)",    minVersion: "1.0", info: "Returns the number of nodes in a node-set",                   blogSlug: "xpath-count" },
  { label: "id(string)",         minVersion: "1.0", info: "Selects elements by their unique ID attribute", blogSlug: "xpath-id" },
  { label: "local-name(node?)",  minVersion: "1.0", info: "Returns the local part of a node's name", blogSlug: "xpath-local-name" },
  { label: "namespace-uri(node?)", minVersion: "1.0", info: "Returns the namespace URI of a node", blogSlug: "xpath-namespace-uri" },
  { label: "name(node?)",        minVersion: "1.0", info: "Returns the qualified name of a node", blogSlug: "xpath-name" },
  // 1.0 string
  { label: "string(object?)",            minVersion: "1.0", info: "Converts an object to a string", blogSlug: "xpath-string" },
  { label: "concat(str, str, ...)",      minVersion: "1.0", info: "Concatenates two or more strings",                    blogSlug: "xpath-concat" },
  { label: "starts-with(str, prefix)",   minVersion: "1.0", info: "Returns true if str starts with prefix", blogSlug: "xpath-starts-with" },
  { label: "contains(str, substr)",      minVersion: "1.0", info: "Returns true if str contains substr",                 blogSlug: "xpath-contains" },
  { label: "substring-before(str, sep)", minVersion: "1.0", info: "Returns the part of str before the first sep", blogSlug: "xpath-substring-before" },
  { label: "substring-after(str, sep)",  minVersion: "1.0", info: "Returns the part of str after the first sep", blogSlug: "xpath-substring-after" },
  { label: "substring(str, start, len?)", minVersion: "1.0", info: "Returns a substring (1-based)",                     blogSlug: "xpath-substring" },
  { label: "string-length(str?)",        minVersion: "1.0", info: "Returns the length of a string", blogSlug: "xpath-string-length" },
  { label: "normalize-space(str?)",      minVersion: "1.0", info: "Strips leading/trailing whitespace and collapses internal whitespace", blogSlug: "xpath-normalize-space" },
  { label: "translate(str, from, to)",   minVersion: "1.0", info: "Replaces characters in str: each char in from is replaced by the corresponding char in to", blogSlug: "xpath-translate" },
  // 1.0 boolean
  { label: "boolean(object)",    minVersion: "1.0", info: "Converts an object to boolean", blogSlug: "xpath-boolean" },
  { label: "not(boolean)",       minVersion: "1.0", info: "Returns the boolean negation", blogSlug: "xpath-not" },
  { label: "true()",             minVersion: "1.0", info: "Returns true", blogSlug: "xpath-true" },
  { label: "false()",            minVersion: "1.0", info: "Returns false", blogSlug: "xpath-false" },
  { label: "lang(string)",       minVersion: "1.0", info: "Returns true if the context node's language matches", blogSlug: "xpath-lang" },
  // 1.0 number
  { label: "number(object?)",    minVersion: "1.0", info: "Converts an object to a number", blogSlug: "xpath-number" },
  { label: "sum(node-set)",      minVersion: "1.0", info: "Returns the sum of numeric values in a node-set",             blogSlug: "xpath-sum" },
  { label: "floor(number)",      minVersion: "1.0", info: "Rounds down to the nearest integer", blogSlug: "xpath-floor" },
  { label: "ceiling(number)",    minVersion: "1.0", info: "Rounds up to the nearest integer", blogSlug: "xpath-ceiling" },
  { label: "round(number)",      minVersion: "1.0", info: "Rounds to the nearest integer", blogSlug: "xpath-round" },
  // XSLT 1.0 extra
  { label: "key(name, value)",   minVersion: "1.0", info: "Looks up nodes using a key defined with xsl:key",             blogSlug: "xpath-key" },
  { label: "format-number(num, pattern, decimalFormat?)", minVersion: "1.0", info: "Formats a number using a decimal format pattern", blogSlug: "xpath-format-number" },
  { label: "current()",          minVersion: "1.0", info: "Returns the current node (differs from . inside predicates)",  blogSlug: "xpath-current" },
  { label: "document(uri, node?)", minVersion: "1.0", info: "Loads an external XML document", blogSlug: "xpath-document" },
  { label: "unparsed-entity-uri(name)", minVersion: "1.0", info: "Returns the URI of an unparsed entity", blogSlug: "xpath-unparsed-entity-uri" },
  { label: "generate-id(node?)", minVersion: "1.0", info: "Generates a unique string ID for a node", blogSlug: "xpath-generate-id" },
  { label: "system-property(name)", minVersion: "1.0", info: "Returns XSLT system properties (xsl:version, xsl:vendor, ...)", blogSlug: "xpath-system-property" },
  { label: "element-available(name)", minVersion: "1.0", info: "Returns true if the element is available", blogSlug: "xpath-element-available" },
  { label: "function-available(name)", minVersion: "1.0", info: "Returns true if the function is available", blogSlug: "xpath-function-available" },
  // 2.0 string
  { label: "string-join(seq, sep?)",        minVersion: "2.0", info: "Joins a sequence of strings with a separator",     blogSlug: "xpath-string-join" },
  { label: "tokenize(str, pattern)",         minVersion: "2.0", info: "Splits a string by a regex pattern",              blogSlug: "xpath-tokenize" },
  { label: "matches(str, pattern, flags?)",  minVersion: "2.0", info: "Returns true if str matches a regex",             blogSlug: "xpath-matches" },
  { label: "replace(str, pattern, replacement, flags?)", minVersion: "2.0", info: "Replaces regex matches in a string",  blogSlug: "xpath-replace" },
  { label: "upper-case(str)",               minVersion: "2.0", info: "Converts a string to uppercase", blogSlug: "xpath-upper-case" },
  { label: "lower-case(str)",               minVersion: "2.0", info: "Converts a string to lowercase", blogSlug: "xpath-lower-case" },
  { label: "ends-with(str, suffix)",         minVersion: "2.0", info: "Returns true if str ends with suffix", blogSlug: "xpath-ends-with" },
  { label: "codepoints-to-string(seq)",      minVersion: "2.0", info: "Converts Unicode codepoints to a string", blogSlug: "xpath-codepoints-to-string" },
  { label: "string-to-codepoints(str)",      minVersion: "2.0", info: "Converts a string to a sequence of Unicode codepoints", blogSlug: "xpath-string-to-codepoints" },
  { label: "compare(str1, str2, collation?)", minVersion: "2.0", info: "Compares two strings, returns -1, 0 or 1", blogSlug: "xpath-compare" },
  { label: "normalize-unicode(str, form?)",  minVersion: "2.0", info: "Normalizes a string to a Unicode normalization form", blogSlug: "xpath-normalize-unicode" },
  // 2.0 sequence
  { label: "empty(seq)",                    minVersion: "2.0", info: "Returns true if the sequence is empty", blogSlug: "xpath-empty" },
  { label: "exists(seq)",                   minVersion: "2.0", info: "Returns true if the sequence is non-empty", blogSlug: "xpath-exists" },
  { label: "distinct-values(seq, collation?)", minVersion: "2.0", info: "Returns distinct values from a sequence", blogSlug: "xpath-distinct-values" },
  { label: "insert-before(seq, pos, ins)",  minVersion: "2.0", info: "Inserts items into a sequence at a position", blogSlug: "xpath-insert-before" },
  { label: "remove(seq, pos)",              minVersion: "2.0", info: "Removes an item at a position from a sequence", blogSlug: "xpath-remove" },
  { label: "reverse(seq)",                  minVersion: "2.0", info: "Reverses a sequence", blogSlug: "xpath-reverse" },
  { label: "subsequence(seq, start, len?)", minVersion: "2.0", info: "Returns a subsequence", blogSlug: "xpath-subsequence" },
  { label: "unordered(seq)",                minVersion: "2.0", info: "Returns items in implementation-defined order (hint to optimizer)", blogSlug: "xpath-unordered" },
  { label: "index-of(seq, value, collation?)", minVersion: "2.0", info: "Returns positions of a value in a sequence", blogSlug: "xpath-index-of" },
  { label: "deep-equal(seq1, seq2, collation?)", minVersion: "2.0", info: "Returns true if two sequences are deeply equal", blogSlug: "xpath-deep-equal" },
  { label: "zero-or-one(seq)",              minVersion: "2.0", info: "Asserts the sequence has 0 or 1 items", blogSlug: "xpath-zero-or-one" },
  { label: "exactly-one(seq)",              minVersion: "2.0", info: "Asserts the sequence has exactly 1 item", blogSlug: "xpath-exactly-one" },
  { label: "one-or-more(seq)",              minVersion: "2.0", info: "Asserts the sequence has 1 or more items", blogSlug: "xpath-one-or-more" },
  // 2.0 numeric
  { label: "abs(number)",                   minVersion: "2.0", info: "Returns the absolute value", blogSlug: "xpath-abs" },
  { label: "min(seq, collation?)",          minVersion: "2.0", info: "Returns the minimum value in a sequence", blogSlug: "xpath-min" },
  { label: "max(seq, collation?)",          minVersion: "2.0", info: "Returns the maximum value in a sequence", blogSlug: "xpath-max" },
  { label: "avg(seq)",                      minVersion: "2.0", info: "Returns the average of a sequence of numeric values", blogSlug: "xpath-avg" },
  // 2.0 date/time
  { label: "current-date()",                minVersion: "2.0", info: "Returns today's date as xs:date", blogSlug: "xpath-current-date" },
  { label: "current-time()",                minVersion: "2.0", info: "Returns current time as xs:time", blogSlug: "xpath-current-time" },
  { label: "current-dateTime()",            minVersion: "2.0", info: "Returns current date+time as xs:dateTime", blogSlug: "xpath-current-date-time" },
  { label: "year-from-date(date)",          minVersion: "2.0", info: "Extracts the year from an xs:date", blogSlug: "xpath-year-from-date" },
  { label: "month-from-date(date)",         minVersion: "2.0", info: "Extracts the month from an xs:date", blogSlug: "xpath-month-from-date" },
  { label: "day-from-date(date)",           minVersion: "2.0", info: "Extracts the day from an xs:date", blogSlug: "xpath-day-from-date" },
  { label: "hours-from-time(time)",         minVersion: "2.0", info: "Extracts hours from xs:time", blogSlug: "xpath-hours-from-time" },
  { label: "minutes-from-time(time)",       minVersion: "2.0", info: "Extracts minutes from xs:time", blogSlug: "xpath-minutes-from-time" },
  { label: "seconds-from-time(time)",       minVersion: "2.0", info: "Extracts seconds from xs:time", blogSlug: "xpath-seconds-from-time" },
  { label: "format-date(date, picture, lang?, calendar?, place?)", minVersion: "2.0", info: "Formats an xs:date using a picture string",  blogSlug: "xpath-format-date" },
  { label: "format-time(time, picture, lang?, calendar?, place?)", minVersion: "2.0", info: "Formats an xs:time using a picture string", blogSlug: "xpath-format-time" },
  { label: "format-dateTime(dateTime, picture, lang?, calendar?, place?)", minVersion: "2.0", info: "Formats an xs:dateTime using a picture string", blogSlug: "xpath-format-date-time" },
  // 2.0 node
  { label: "base-uri(node?)",               minVersion: "2.0", info: "Returns the base URI of a node", blogSlug: "xpath-base-uri" },
  { label: "document-uri(node?)",           minVersion: "2.0", info: "Returns the URI of a document node", blogSlug: "xpath-document-uri" },
  { label: "nilled(node?)",                 minVersion: "2.0", info: "Returns true if a node is nilled", blogSlug: "xpath-nilled" },
  { label: "node-name(node?)",              minVersion: "2.0", info: "Returns the name of a node as xs:QName", blogSlug: "xpath-node-name" },
  // 2.0 QName / misc
  { label: "QName(uri, name)",              minVersion: "2.0", info: "Creates an xs:QName value", blogSlug: "xpath-qname" },
  { label: "local-name-from-QName(qname)",  minVersion: "2.0", info: "Returns the local part of an xs:QName", blogSlug: "xpath-local-name-from-qname" },
  { label: "namespace-uri-from-QName(qname)", minVersion: "2.0", info: "Returns the namespace URI of an xs:QName", blogSlug: "xpath-namespace-uri-from-qname" },
  { label: "prefix-from-QName(qname)",      minVersion: "2.0", info: "Returns the prefix of an xs:QName", blogSlug: "xpath-prefix-from-qname" },
  { label: "resolve-QName(str, element)",   minVersion: "2.0", info: "Resolves a lexical QName using in-scope namespaces", blogSlug: "xpath-resolve-qname" },
  { label: "error(qname?, desc?, obj?)",    minVersion: "2.0", info: "Raises an error", blogSlug: "xpath-error" },
  { label: "trace(value, label?)",          minVersion: "2.0", info: "Emits a trace message and returns the value unchanged", blogSlug: "xpath-trace" },
  { label: "static-base-uri()",             minVersion: "2.0", info: "Returns the static base URI of the stylesheet", blogSlug: "xpath-static-base-uri" },
  { label: "implicit-timezone()",           minVersion: "2.0", info: "Returns the implicit timezone", blogSlug: "xpath-implicit-timezone" },
  // 3.0 functional
  { label: "apply(func, args)",             minVersion: "3.0", info: "Calls a function with an array of arguments", blogSlug: "xpath-apply" },
  { label: "function-lookup(name, arity)",  minVersion: "3.0", info: "Returns a function by name and arity, or the empty sequence", blogSlug: "xpath-function-lookup" },
  { label: "function-name(func)",           minVersion: "3.0", info: "Returns the name of a function item", blogSlug: "xpath-function-name" },
  { label: "function-arity(func)",          minVersion: "3.0", info: "Returns the arity of a function item", blogSlug: "xpath-function-arity" },
  { label: "for-each(seq, func)",           minVersion: "3.0", info: "Applies a function to each item of a sequence", blogSlug: "xpath-for-each" },
  { label: "filter(seq, func)",             minVersion: "3.0", info: "Filters a sequence by a predicate function", blogSlug: "xpath-filter" },
  { label: "fold-left(seq, zero, func)",    minVersion: "3.0", info: "Left-fold: accumulates a result over a sequence", blogSlug: "xpath-fold-left" },
  { label: "fold-right(seq, zero, func)",   minVersion: "3.0", info: "Right-fold: accumulates a result over a sequence (from the right)", blogSlug: "xpath-fold-right" },
  { label: "for-each-pair(seq1, seq2, func)", minVersion: "3.0", info: "Applies a function to pairs of items from two sequences", blogSlug: "xpath-for-each-pair" },
  { label: "sort(seq, collation?, key?)",   minVersion: "3.0", info: "Sorts a sequence (functional alternative to xsl:sort)", blogSlug: "xpath-sort" },
  { label: "random-number-generator(seed?)", minVersion: "3.0", info: "Returns a random number generator map", blogSlug: "xpath-random-number-generator" },
  // 3.0 map
  { label: "map:merge(maps, options?)",     minVersion: "3.0", info: "Merges multiple maps into one", blogSlug: "xpath-map-merge" },
  { label: "map:size(map)",                 minVersion: "3.0", info: "Returns the number of entries in a map", blogSlug: "xpath-map-size" },
  { label: "map:keys(map)",                 minVersion: "3.0", info: "Returns the keys of a map as a sequence", blogSlug: "xpath-map-keys" },
  { label: "map:contains(map, key)",        minVersion: "3.0", info: "Returns true if the map contains the key", blogSlug: "xpath-map-contains" },
  { label: "map:get(map, key)",             minVersion: "3.0", info: "Returns the value for a key in a map, or the empty sequence", blogSlug: "xpath-map-get" },
  { label: "map:put(map, key, value)",      minVersion: "3.0", info: "Returns a new map with the key-value pair added or updated", blogSlug: "xpath-map-put" },
  { label: "map:remove(map, keys)",         minVersion: "3.0", info: "Returns a new map with specified keys removed", blogSlug: "xpath-map-remove" },
  { label: "map:entry(key, value)",         minVersion: "3.0", info: "Creates a singleton map with one key-value entry", blogSlug: "xpath-map-entry" },
  // 3.0 array
  { label: "array:size(array)",             minVersion: "3.0", info: "Returns the number of members in an array", blogSlug: "xpath-array-size" },
  { label: "array:get(array, pos)",         minVersion: "3.0", info: "Returns the member at a 1-based position", blogSlug: "xpath-array-get" },
  { label: "array:put(array, pos, val)",    minVersion: "3.0", info: "Returns a new array with a member replaced", blogSlug: "xpath-array-put" },
  { label: "array:append(array, val)",      minVersion: "3.0", info: "Appends a member to an array", blogSlug: "xpath-array-append" },
  { label: "array:head(array)",             minVersion: "3.0", info: "Returns the first member of an array", blogSlug: "xpath-array-head" },
  { label: "array:tail(array)",             minVersion: "3.0", info: "Returns all but the first member of an array", blogSlug: "xpath-array-tail" },
  { label: "array:reverse(array)",          minVersion: "3.0", info: "Reverses an array", blogSlug: "xpath-array-reverse" },
  { label: "array:join(arrays)",            minVersion: "3.0", info: "Concatenates multiple arrays", blogSlug: "xpath-array-join" },
  { label: "array:subarray(array, start, length?)", minVersion: "3.0", info: "Returns a sub-array", blogSlug: "xpath-array-subarray" },
  { label: "array:remove(array, positions)", minVersion: "3.0", info: "Removes members at specified positions", blogSlug: "xpath-array-remove" },
  { label: "array:insert-before(array, pos, members)", minVersion: "3.0", info: "Inserts members before a position", blogSlug: "xpath-array-insert-before" },
  { label: "array:for-each(array, func)",   minVersion: "3.0", info: "Applies a function to each member of an array", blogSlug: "xpath-array-for-each" },
  { label: "array:filter(array, func)",     minVersion: "3.0", info: "Filters array members by a predicate", blogSlug: "xpath-array-filter" },
  { label: "array:fold-left(array, zero, func)", minVersion: "3.0", info: "Left-fold over an array", blogSlug: "xpath-array-fold-left" },
  { label: "array:fold-right(array, zero, func)", minVersion: "3.0", info: "Right-fold over an array", blogSlug: "xpath-array-fold-right" },
  { label: "array:for-each-pair(arr1, arr2, func)", minVersion: "3.0", info: "Applies a function to pairs from two arrays", blogSlug: "xpath-array-for-each-pair" },
  { label: "array:sort(array, collation?, key?)", minVersion: "3.0", info: "Sorts an array", blogSlug: "xpath-array-sort" },
  { label: "array:flatten(items)",          minVersion: "3.0", info: "Recursively flattens arrays to a sequence", blogSlug: "xpath-array-flatten" },
  // 3.0 misc
  { label: "environment-variable(name)",    minVersion: "3.0", info: "Returns the value of an environment variable (if available)", blogSlug: "xpath-environment-variable" },
  { label: "available-environment-variables()", minVersion: "3.0", info: "Returns the names of available environment variables", blogSlug: "xpath-available-environment-variables" },
  { label: "unparsed-text(uri, encoding?)", minVersion: "2.0", info: "Reads a text file and returns it as a string", blogSlug: "xpath-unparsed-text" },
  { label: "unparsed-text-lines(uri, encoding?)", minVersion: "2.0", info: "Reads a text file and returns lines as a sequence", blogSlug: "xpath-unparsed-text-lines" },
  { label: "unparsed-text-available(uri, encoding?)", minVersion: "2.0", info: "Returns true if unparsed-text() would succeed", blogSlug: "xpath-unparsed-text-available" },
  { label: "uri-collection(uri?)",          minVersion: "2.0", info: "Returns a sequence of URIs from a collection", blogSlug: "xpath-uri-collection" },
  { label: "collection(uri?)",              minVersion: "2.0", info: "Returns a sequence of nodes from a collection", blogSlug: "xpath-collection" },
  { label: "json-doc(uri, options?)",       minVersion: "3.0", info: "Parses a JSON document from a URI into an XDM map/array", blogSlug: "xpath-json-doc" },
  { label: "json-to-xml(str, options?)",    minVersion: "3.0", info: "Converts a JSON string to an XML representation", blogSlug: "xpath-json-to-xml" },
  { label: "xml-to-json(node, options?)",   minVersion: "3.0", info: "Converts an XML node to a JSON string", blogSlug: "xpath-xml-to-json" },
  { label: "parse-json(str, options?)",     minVersion: "3.0", info: "Parses a JSON string into an XDM map/array/atomic value", blogSlug: "xpath-parse-json" },
  { label: "serialize(node, params?)",      minVersion: "3.0", info: "Serializes a node or sequence to a string", blogSlug: "xpath-serialize" },
  { label: "parse-xml(str)",               minVersion: "2.0", info: "Parses a string as XML and returns a document node", blogSlug: "xpath-parse-xml" },
  { label: "parse-xml-fragment(str)",       minVersion: "2.0", info: "Parses a well-balanced XML fragment", blogSlug: "xpath-parse-xml-fragment" },
  { label: "has-children(node?)",           minVersion: "3.0", info: "Returns true if the node has child nodes", blogSlug: "xpath-has-children" },
  { label: "innermost(nodes)",              minVersion: "3.0", info: "Returns the nodes that are not ancestors of any other node in the set", blogSlug: "xpath-innermost" },
  { label: "outermost(nodes)",              minVersion: "3.0", info: "Returns the nodes that are not descendants of any other node in the set", blogSlug: "xpath-outermost" },
  { label: "path(node?)",                   minVersion: "3.0", info: "Returns an XPath expression describing the path to the node", blogSlug: "xpath-path" },
  { label: "generate-id(node?)",            minVersion: "1.0", info: "Returns a unique string identifier for a node", blogSlug: "xpath-generate-id" },
  { label: "accumulator-before(name)",      minVersion: "3.0", info: "Returns the value of an accumulator before processing the current node", blogSlug: "xpath-accumulator-before" },
  { label: "accumulator-after(name)",       minVersion: "3.0", info: "Returns the value of an accumulator after processing the current node", blogSlug: "xpath-accumulator-after" },
  { label: "current-group()",               minVersion: "2.0", info: "Returns the current group within xsl:for-each-group", blogSlug: "xpath-current-group" },
  { label: "current-grouping-key()",        minVersion: "2.0", info: "Returns the grouping key of the current group", blogSlug: "xpath-current-grouping-key" },
  { label: "current-merge-group(source?)",  minVersion: "3.0", info: "Returns the current merge group within xsl:merge", blogSlug: "xpath-current-merge-group" },
  { label: "current-merge-key()",           minVersion: "3.0", info: "Returns the current merge key within xsl:merge", blogSlug: "xpath-current-merge-key" },
  { label: "current-output-uri()",          minVersion: "2.0", info: "Returns the URI of the current output document", blogSlug: "xpath-current-output-uri" },
  { label: "regex-group(n)",                minVersion: "2.0", info: "Returns a captured group from xsl:analyze-string", blogSlug: "xpath-regex-group" },
  { label: "type-available(type)",          minVersion: "2.0", info: "Returns true if a schema type is available", blogSlug: "xpath-type-available" },
  { label: "copy-of(seq)",                  minVersion: "2.0", info: "Returns a deep copy of a sequence (XQuery/XPath 2.0)", blogSlug: "xpath-copy-of" },
  { label: "snapshot(seq)",                 minVersion: "3.0", info: "Returns a snapshot of the sequence (for streaming)", blogSlug: "xpath-snapshot" },
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

// ─── Attribute definitions per xsl:element ───────────────────────────────────

const YES_NO = ["yes", "no"];
const VALIDATION = ["strict", "lax", "preserve", "strip"];

export const ELEMENT_ATTRS = {
  "xsl:stylesheet": [
    { name: "version", values: ["1.0", "2.0", "3.0"] },
    { name: "xmlns:xsl", values: ["http://www.w3.org/1999/XSL/Transform"] },
    { name: "exclude-result-prefixes" },
    { name: "extension-element-prefixes" },
    { name: "default-validation", values: VALIDATION },
    { name: "xpath-default-namespace" },
    { name: "expand-text", values: YES_NO },
  ],
  "xsl:transform": [
    { name: "version", values: ["1.0", "2.0", "3.0"] },
    { name: "xmlns:xsl", values: ["http://www.w3.org/1999/XSL/Transform"] },
    { name: "exclude-result-prefixes" },
  ],
  "xsl:template": [
    { name: "match" },
    { name: "name" },
    { name: "priority" },
    { name: "mode" },
    { name: "as" },
    { name: "visibility", values: ["public", "private", "final", "abstract"] },
  ],
  "xsl:apply-templates": [
    { name: "select" },
    { name: "mode" },
  ],
  "xsl:call-template": [
    { name: "name" },
  ],
  "xsl:value-of": [
    { name: "select" },
    { name: "separator" },
    { name: "disable-output-escaping", values: YES_NO },
  ],
  "xsl:for-each": [
    { name: "select" },
  ],
  "xsl:for-each-group": [
    { name: "select" },
    { name: "group-by" },
    { name: "group-adjacent" },
    { name: "group-starting-with" },
    { name: "group-ending-with" },
    { name: "collation" },
    { name: "bind-group" },
    { name: "bind-grouping-key" },
  ],
  "xsl:if": [
    { name: "test" },
  ],
  "xsl:when": [
    { name: "test" },
  ],
  "xsl:variable": [
    { name: "name" },
    { name: "select" },
    { name: "as" },
    { name: "static", values: YES_NO },
    { name: "visibility", values: ["public", "private", "final", "abstract"] },
  ],
  "xsl:param": [
    { name: "name" },
    { name: "select" },
    { name: "as" },
    { name: "required", values: YES_NO },
    { name: "tunnel", values: YES_NO },
    { name: "static", values: YES_NO },
  ],
  "xsl:with-param": [
    { name: "name" },
    { name: "select" },
    { name: "as" },
    { name: "tunnel", values: YES_NO },
  ],
  "xsl:sort": [
    { name: "select" },
    { name: "order", values: ["ascending", "descending"] },
    { name: "data-type", values: ["text", "number"] },
    { name: "case-order", values: ["upper-first", "lower-first"] },
    { name: "lang" },
    { name: "collation" },
    { name: "stable", values: YES_NO },
  ],
  "xsl:copy": [
    { name: "copy-namespaces", values: YES_NO },
    { name: "use-attribute-sets" },
    { name: "validation", values: VALIDATION },
    { name: "inherit-namespaces", values: YES_NO },
  ],
  "xsl:copy-of": [
    { name: "select" },
    { name: "copy-namespaces", values: YES_NO },
    { name: "validation", values: VALIDATION },
  ],
  "xsl:element": [
    { name: "name" },
    { name: "namespace" },
    { name: "use-attribute-sets" },
    { name: "validation", values: VALIDATION },
    { name: "inherit-namespaces", values: YES_NO },
  ],
  "xsl:attribute": [
    { name: "name" },
    { name: "namespace" },
    { name: "select" },
    { name: "separator" },
    { name: "validation", values: VALIDATION },
    { name: "disable-output-escaping", values: YES_NO },
  ],
  "xsl:attribute-set": [
    { name: "name" },
    { name: "use-attribute-sets" },
    { name: "visibility", values: ["public", "private", "final", "abstract"] },
  ],
  "xsl:comment": [
    { name: "select" },
  ],
  "xsl:processing-instruction": [
    { name: "name" },
    { name: "select" },
  ],
  "xsl:text": [
    { name: "disable-output-escaping", values: YES_NO },
  ],
  "xsl:include": [
    { name: "href" },
  ],
  "xsl:import": [
    { name: "href" },
  ],
  "xsl:output": [
    { name: "name" },
    { name: "method", values: ["xml", "html", "xhtml", "text", "json", "adaptive"] },
    { name: "version" },
    { name: "encoding" },
    { name: "omit-xml-declaration", values: YES_NO },
    { name: "standalone", values: ["yes", "no", "omit"] },
    { name: "doctype-public" },
    { name: "doctype-system" },
    { name: "cdata-section-elements" },
    { name: "indent", values: YES_NO },
    { name: "media-type" },
    { name: "include-content-type", values: YES_NO },
    { name: "escape-uri-attributes", values: YES_NO },
    { name: "use-character-maps" },
    { name: "suppress-indentation" },
    { name: "expand-text", values: YES_NO },
    { name: "build-tree", values: YES_NO },
  ],
  "xsl:key": [
    { name: "name" },
    { name: "match" },
    { name: "use" },
    { name: "collation" },
    { name: "composite", values: YES_NO },
  ],
  "xsl:number": [
    { name: "value" },
    { name: "select" },
    { name: "level", values: ["single", "multiple", "any"] },
    { name: "count" },
    { name: "from" },
    { name: "format" },
    { name: "lang" },
    { name: "letter-value", values: ["alphabetic", "traditional"] },
    { name: "grouping-separator" },
    { name: "grouping-size" },
    { name: "ordinal" },
    { name: "start-at" },
  ],
  "xsl:message": [
    { name: "select" },
    { name: "terminate", values: YES_NO },
    { name: "error-code" },
  ],
  "xsl:preserve-space": [{ name: "elements" }],
  "xsl:strip-space":    [{ name: "elements" }],
  "xsl:namespace-alias": [
    { name: "stylesheet-prefix" },
    { name: "result-prefix" },
  ],
  "xsl:decimal-format": [
    { name: "name" },
    { name: "decimal-separator" },
    { name: "grouping-separator" },
    { name: "infinity" },
    { name: "minus-sign" },
    { name: "NaN" },
    { name: "percent" },
    { name: "per-mille" },
    { name: "zero-digit" },
    { name: "digit" },
    { name: "pattern-separator" },
    { name: "exponent-separator" },
  ],
  // XSLT 2.0
  "xsl:function": [
    { name: "name" },
    { name: "as" },
    { name: "visibility", values: ["public", "private", "final", "abstract"] },
    { name: "override-extension-function", values: YES_NO },
    { name: "new-each-time", values: ["yes", "no", "maybe"] },
    { name: "cache", values: YES_NO },
  ],
  "xsl:sequence":       [{ name: "select" }],
  "xsl:perform-sort":   [{ name: "select" }],
  "xsl:result-document": [
    { name: "href" },
    { name: "format" },
    { name: "method", values: ["xml", "html", "xhtml", "text", "json"] },
    { name: "indent", values: YES_NO },
    { name: "encoding" },
    { name: "omit-xml-declaration", values: YES_NO },
    { name: "validation", values: VALIDATION },
    { name: "output-version" },
  ],
  "xsl:analyze-string": [
    { name: "select" },
    { name: "regex" },
    { name: "flags" },
  ],
  "xsl:namespace":      [{ name: "name" }, { name: "select" }],
  "xsl:import-schema":  [{ name: "namespace" }, { name: "schema-location" }],
  "xsl:character-map":  [{ name: "name" }, { name: "use-character-maps" }],
  "xsl:output-character": [{ name: "character" }, { name: "string" }],
  "xsl:next-match":     [],
  // XSLT 3.0
  "xsl:mode": [
    { name: "name" },
    { name: "on-no-match", values: ["deep-copy", "shallow-copy", "deep-skip", "shallow-skip", "text-only-copy", "fail"] },
    { name: "on-multiple-match", values: ["use-last", "fail"] },
    { name: "warning-on-no-match", values: YES_NO },
    { name: "warning-on-multiple-match", values: YES_NO },
    { name: "visibility", values: ["public", "private", "final"] },
    { name: "streamable", values: YES_NO },
    { name: "typed", values: ["yes", "no", "strict", "lax", "untyped"] },
  ],
  "xsl:iterate":        [{ name: "select" }],
  "xsl:break":          [{ name: "select" }],
  "xsl:map-entry":      [{ name: "key" }, { name: "select" }],
  "xsl:array-member":   [{ name: "select" }],
  "xsl:try":            [{ name: "select" }, { name: "rollback-output", values: YES_NO }],
  "xsl:accumulator": [
    { name: "name" },
    { name: "as" },
    { name: "initial-value" },
    { name: "streamable", values: YES_NO },
  ],
  "xsl:accumulator-rule": [
    { name: "match" },
    { name: "phase", values: ["start", "end"] },
    { name: "select" },
  ],
  "xsl:stream":        [{ name: "href" }],
};

/**
 * Returns ElementSpec[] for the xml() schema, filtered by active XSLT version.
 * This enables built-in attribute completion from @codemirror/lang-xml.
 */
export function getXmlElements(xsltVersion = "1.0") {
  const maxV = VERSION_ORDER[xsltVersion] ?? 1;
  return Object.entries(ELEMENT_ATTRS)
    .filter(([name]) => {
      const el = XSL_ELEMENTS.find((e) => e.label === name);
      return !el || (VERSION_ORDER[el.minVersion] ?? 1) <= maxV;
    })
    .map(([name, attributes]) => ({ name, attributes }));
}

// ─── Hover tooltip ────────────────────────────────────────────────────────────

function buildTooltipDom(entry) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "padding:8px 10px;max-width:340px;line-height:1.5;font-size:13px";
  // Prevent CodeMirror from intercepting mousedown inside the tooltip,
  // which would close it and block link navigation.
  wrap.addEventListener("mousedown", (e) => e.stopPropagation());

  const title = document.createElement("strong");
  title.textContent = entry.label;
  wrap.appendChild(title);

  if (entry.minVersion && entry.minVersion !== "1.0") {
    const badge = document.createElement("span");
    badge.textContent = ` XSLT/XPath ${entry.minVersion}+`;
    badge.style.cssText = "margin-left:6px;font-size:11px;opacity:0.6";
    wrap.appendChild(badge);
  }

  const desc = document.createElement("p");
  desc.style.cssText = "margin:4px 0 0";
  desc.textContent = entry.info;
  wrap.appendChild(desc);

  if (entry.args) {
    const pre = document.createElement("pre");
    pre.style.cssText = "margin:6px 0 0;font-size:11px;opacity:0.7;white-space:pre-wrap";
    pre.textContent = entry.label.startsWith("xsl:")
      ? `<${entry.label} ${entry.args}>`
      : `${entry.label.replace(/\(.*/, "")}(${entry.args})`;
    wrap.appendChild(pre);
  }

  if (entry.blogSlug) {
    const a = document.createElement("a");
    a.href = `https://blog.xsltplayground.com/xslt/functions/${entry.blogSlug}`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.cssText = "display:block;margin-top:6px;font-size:11px";
    a.textContent = "Full docs →";
    wrap.appendChild(a);
  }

  return wrap;
}

/**
 * Returns a hoverTooltip extension that shows info for xsl:* elements and
 * XPath functions already present in the editor text.
 */
export function getHoverTooltip(xsltVersion = "1.0") {
  const maxV = VERSION_ORDER[xsltVersion] ?? 1;

  // Build lookup: full label → entry
  const lookup = new Map();
  for (const e of XSL_ELEMENTS) {
    if ((VERSION_ORDER[e.minVersion] ?? 1) <= maxV) lookup.set(e.label, e);
  }
  for (const e of XPATH_FUNCTIONS) {
    if ((VERSION_ORDER[e.minVersion] ?? 1) <= maxV) {
      lookup.set(e.label, e);
      // also index by bare name so hovering "string-join" (without args) works
      const bare = e.label.replace(/\(.*$/, "");
      if (!lookup.has(bare)) lookup.set(bare, e);
    }
  }

  return {
    // Return a hoverTooltip-compatible descriptor; the caller will wrap this
    // with hoverTooltip() from @codemirror/view.
    __isHoverDescriptor: true,
    resolve(view, pos) {
      const line = view.state.doc.lineAt(pos);
      const text = line.text;
      const col = pos - line.from;

      // Try xsl:element-name pattern
      for (const m of text.matchAll(/xsl:[\w-]+/g)) {
        if (m.index <= col && col <= m.index + m[0].length) {
          const entry = lookup.get(m[0]);
          if (entry) {
            return {
              pos: line.from + m.index,
              end: line.from + m.index + m[0].length,
              above: true,
              create: () => ({ dom: buildTooltipDom(entry) }),
            };
          }
        }
      }

      // Try XPath function name (word chars + optional colon, followed by open paren)
      for (const m of text.matchAll(/[\w:-]+(?=\s*\()/g)) {
        if (m.index <= col && col <= m.index + m[0].length) {
          const entry = lookup.get(m[0]) || lookup.get(m[0] + "()");
          if (entry) {
            return {
              pos: line.from + m.index,
              end: line.from + m.index + m[0].length,
              above: true,
              create: () => ({ dom: buildTooltipDom(entry) }),
            };
          }
        }
      }

      return null;
    },
  };
}
