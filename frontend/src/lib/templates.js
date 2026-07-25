// Starter templates. Production error logs showed people running transforms with
// no source document at all (the "no source document" error was among the most
// frequent), so every template ships with input XML that already works.
//
// Each entry is shaped like a workspace override for defaultTab().

const STYLESHEET_HEAD = '<xsl:stylesheet version="VERSION" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">';

function sheet(version, body) {
  return `${STYLESHEET_HEAD.replace("VERSION", version)}\n${body}\n</xsl:stylesheet>`;
}

const ORDERS_XML = `<orders>
  <order id="1" country="ES" total="120.50"/>
  <order id="2" country="FR" total="80.00"/>
  <order id="3" country="ES" total="45.25"/>
  <order id="4" country="DE" total="200.00"/>
</orders>`;

export const TEMPLATES = [
  {
    id: "xml-to-html",
    title: "XML → HTML table",
    description: "Render a document as an HTML table with xsl:for-each.",
    version: "1.0",
    xslt: sheet(
      "1.0",
      `  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/">
    <table border="1">
      <tr><th>ID</th><th>Country</th><th>Total</th></tr>
      <xsl:for-each select="orders/order">
        <tr>
          <td><xsl:value-of select="@id"/></td>
          <td><xsl:value-of select="@country"/></td>
          <td><xsl:value-of select="@total"/></td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:template>`,
    ),
    params: [{ name: "input", value: ORDERS_XML, open: true }],
  },
  {
    id: "grouping",
    title: "Group by (xsl:for-each-group)",
    description: "Group nodes and aggregate totals — XSLT 2.0 grouping.",
    version: "2.0",
    xslt: sheet(
      "2.0",
      `  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <summary>
      <xsl:for-each-group select="orders/order" group-by="@country">
        <country code="{current-grouping-key()}"
                 orders="{count(current-group())}"
                 total="{sum(current-group()/@total)}"/>
      </xsl:for-each-group>
    </summary>
  </xsl:template>`,
    ),
    params: [{ name: "input", value: ORDERS_XML, open: true }],
  },
  {
    id: "xml-to-csv",
    title: "XML → CSV",
    description: "Emit plain text with string-join and a text output method.",
    version: "2.0",
    xslt: sheet(
      "2.0",
      `  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:text>id,country,total&#10;</xsl:text>
    <xsl:for-each select="orders/order">
      <xsl:value-of select="string-join((@id, @country, @total), ',')"/>
      <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>`,
    ),
    params: [{ name: "input", value: ORDERS_XML, open: true }],
  },
  {
    id: "xml-to-json",
    title: "XML → JSON",
    description: "Build a map and serialise it with xml-to-json — XSLT 3.0.",
    version: "3.0",
    xslt: sheet(
      "3.0",
      `  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:variable name="data">
      <array xmlns="http://www.w3.org/2005/xpath-functions">
        <xsl:for-each select="orders/order">
          <map>
            <number key="id"><xsl:value-of select="@id"/></number>
            <string key="country"><xsl:value-of select="@country"/></string>
            <number key="total"><xsl:value-of select="@total"/></number>
          </map>
        </xsl:for-each>
      </array>
    </xsl:variable>
    <xsl:value-of select="xml-to-json($data, map{'indent': true()})"/>
  </xsl:template>`,
    ),
    params: [{ name: "input", value: ORDERS_XML, open: true }],
  },
  {
    id: "identity-transform",
    title: "Identity transform + override",
    description: "Copy everything, then change just what you need.",
    version: "2.0",
    xslt: sheet(
      "2.0",
      `  <xsl:output method="xml" indent="yes"/>

  <!-- Copy every node as-is... -->
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

  <!-- ...then override only what you want to change. -->
  <xsl:template match="order/@total">
    <xsl:attribute name="total">
      <xsl:value-of select="format-number(. * 1.21, '0.00')"/>
    </xsl:attribute>
  </xsl:template>`,
    ),
    params: [{ name: "input", value: ORDERS_XML, open: true }],
  },
  {
    id: "params",
    title: "Parameters & multiple inputs",
    description: "Filter using a runtime parameter and a second document.",
    version: "2.0",
    xslt: sheet(
      "2.0",
      `  <xsl:output method="xml" indent="yes"/>

  <!-- Set 'country' in the Parameters panel to filter the result. -->
  <xsl:param name="country" select="'ES'"/>

  <xsl:template match="/">
    <selected country="{$country}">
      <xsl:copy-of select="orders/order[@country = $country]"/>
    </selected>
  </xsl:template>`,
    ),
    params: [
      { name: "input", value: ORDERS_XML, open: true },
      { name: "country", value: "ES", open: true },
    ],
  },
  {
    id: "xpath-tester",
    title: "XPath tester",
    description: "Evaluate an XPath expression against XML and list every match.",
    version: "3.0",
    xslt: `<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- Put the expression you want to test here. -->
  <xsl:variable name="expression" select="//order[@country = 'ES']"/>

  <xsl:template match="/">
    <matches count="{count($expression)}">
      <xsl:for-each select="$expression">
        <match position="{position()}">
          <xsl:copy-of select="."/>
        </match>
      </xsl:for-each>
    </matches>
  </xsl:template>
</xsl:stylesheet>`,
    params: [{ name: "input", value: ORDERS_XML, open: true }],
  },
];

export function findTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || null;
}

// Strip the presentation-only fields before handing a template to defaultTab().
export function templateToWorkspace(template) {
  return {
    name: template.title,
    version: template.version,
    xslt: template.xslt,
    params: template.params.map((p) => ({ ...p })),
  };
}
