package com.aicopilot.ai.parser;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Component;
import org.xml.sax.SAXException;

import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Component
public class TikaResumeParser {

    private final AutoDetectParser parser = new AutoDetectParser();

    public String extractText(InputStream inputStream) throws TikaException, IOException, SAXException {
        BodyContentHandler handler = new BodyContentHandler(-1);
        Metadata metadata = new Metadata();
        ParseContext context = new ParseContext();

        parser.parse(inputStream, handler, metadata, context);

        String text = handler.toString().trim();
        log.debug("Extracted {} characters from document", text.length());

        return text;
    }
}
