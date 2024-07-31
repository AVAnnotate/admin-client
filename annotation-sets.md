# Annotation Sets

AVAnnotate desires to have alternate sets of annotations available within the same manifest. This document outlines how we will use the tagging system to implement this enhancement.

## The Annotation Sets Tag Group

In new projects we will implement a default Tag Group called `Annotation Sets` (we will actually name the set in code as `_annotation_sets_`, to continue a practice we started with the `Uncategorized` Tag Group which is named `_uncategorized_` in code). Initially the `Annotation Sets` group will have only one member `Default`, again we will name this `_default_` in code.

- We will update the code to always add the `Default` tag to all annotations in the case where there is only one Annotation Set (Default) defined. 
- The interface should ignore the Annotation Set concept when only the `Default` set exists.




