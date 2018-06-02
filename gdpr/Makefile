
#
# For diagrams you need to install plantuml
#

PUML_FILES := $(shell find diagrams/*.puml -type f)
DIAGRAM_FILES = $(patsubst %.puml, %.svg, $(PUML_FILES))

all: DPIA.pdf

%.svg: %.puml
	echo Converting $<
	plantuml -tsvg $<

DPIA.pdf: DPIA.md template.tex Makefile $(DIAGRAM_FILES)
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