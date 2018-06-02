
#
# For diagrams you need to install plantuml
#

MAIN_TARGET = DPIA.pdf

PUML_FILES := $(shell find diagrams/*.puml -type f)
DIAGRAM_FILES = $(patsubst %.puml, %.svg, $(PUML_FILES))

all: $(MAIN_TARGET)

clean:
	rm -f $(MAIN_TARGET) $(DIAGRAM_FILES)

%.svg: %.puml
	plantuml -tsvg $<

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

.PHONY: clean
