
#
# For diagrams you need to install plantuml
#

MAIN_TARGET = DPIA.pdf

DIAGRAM_EXT = svg
PUML_FILES := $(shell find diagrams/*.puml -type f)
DIAGRAM_FILES = $(patsubst %.puml, %.$(DIAGRAM_EXT), $(PUML_FILES))

all: $(MAIN_TARGET)

clean:
	rm $(MAIN_TARGET)

%.$(DIAGRAM_EXT): %.puml
	plantuml \
		-t$(DIAGRAM_EXT) \
		-Sshadowing=false \
		-SDefaultFontName=Helvetica \
		-Sdpi=300 \
		$<

#		-SDefaultFontSize=14
#		-SPadding=8

%.pdf: %.md template.tex Makefile $(DIAGRAM_FILES)
	pandoc \
		-N \
		--template=template.tex \
		--variable mainfont="Times New Roman" \
		--variable sansfont="Helvetica" \
		--variable monofont="Menlo" \
		--variable fontsize=12pt \
		$< \
		--pdf-engine=xelatex \
		--toc \
		-o $@

.PRECIOUS: %.$(DIAGRAM_EXT)
