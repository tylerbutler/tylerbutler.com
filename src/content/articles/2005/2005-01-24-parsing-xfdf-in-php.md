---

title: Parsing XFDF in PHP
date: '2005-01-24T22:56:00-08:00'
slug: parsing-xfdf-in-php
engineer:
  slug: parsing-xfdf-in-php
  url: /2005/01/parsing-xfdf-in-php/

# Custom Properties
guid: http://blog.tylerbutler.com/index.php/2005/01/parsing-xfdf-in-php/

---

This past week at work I have been working on using Adobe Acrobat to submit
form data. The value of this is that the form data can be reimported into the
PDF form then printed all purty-lookin'. Anyway, Acrobat allows you to submit
your form data in several different formats. One, FDF, is usable in PHP
provided you load this module thingy. Unfortunately, the server I want to run
the PHP script on uses Irix and the module is unavailable for Irix. Poo.

I then turned to XFDF, which is essentially FDF data all XML-ified. PHP has an
XML parser built in, so I don't have to load any crazy modules to parse the
data. Unfortunately, PHP's parser is SAX-based rather than DOM-based, so it
took me a rather long time to figure out how to get it working right. Anyway,
here's the PHP code that essentially takes XFDF data (declare `$file` as a
string pointing to the location of your XFDF file) and parses it into an
associative array (`$values`). The array is indexed by the XFDF field names.
The code below is not entirely complete since I snipped it out of a larger
file, but if you look at it, I think you'll get the idea. It's pretty simple
once you figure out the way PHP does XML processing.

```
/* BEGIN VARIABLE DECLARATIONS */
//global variables for XML parsing
$values = array();
$field = "";
$curTag = "";

/* BEGIN XML PROCESSING */
// XML Parser element start function
function startElement($parser, $name, $attrs)
{
    global $curTag, $field;

    //track the tag we're currently in
    $curTag .= "^$name";

    if( $curTag == "^XFDF^FIELDS^FIELD" )
    {
        //save the name of the field in a global var
        $field = $attrs['NAME'];
    }
}


// XML Parser element end function
function endElement($parser, $name)
{
    global $curTag;

    // remove the tag we're ending from the "tag tracker"
    $caret_pos = [strrpos][1]($curTag,'^');
    $curTag = [substr][2]($curTag, 0, $caret_pos);
}


// XML Parser characterData function
function characterData( $parser, $data )
{
    global $curTag, $values, $field;
    $valueTag = "^XFDF^FIELDS^FIELD^VALUE";

    if( $curTag == $valueTag )
    {
        // we're in the value tag, so put the value in the array
        $values[$field] = $data;
    }
}

// Create the parser and parse the file
$xml_parser = xml_parser_create();
xml_set_element_handler($xml_parser, "startElement", "endElement");
xml_set_character_data_handler($xml_parser, "characterData");

if (!($fp = fopen($file,"r")))
{
    die ("could not open XML for input");
}

while ($data = fread($fp, 4096))
{
  if (!xml_parse($xml_parser, $data, feof($fp)))

    {
        die(sprintf("XML error: %s at line %d",
                    xml_error_string(xml_get_error_code($xml_parser)),
                    xml_get_current_line_number($xml_parser)));
    }
}

xml_parser_free($xml_parser);
flclose($fp);

/* END XML PROCESSING */
```
