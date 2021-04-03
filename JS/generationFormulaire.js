$(function() {
	setDebugStatus();
	// generation des checkBox countries
	generateCountryCheckBoxList("EU");
	generateCountryCheckBoxList("OTHER");
	// generation des checkBox fields
	generateFieldCheckBoxList();
})