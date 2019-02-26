angular.module("umbraco").controller("favorite.content.controller", 
function($scope, $http, editorState, contentEditingHelper) {

    // Initialization Methods //////////////////////////////////////////////////

	/**
    * Triggered on the controller loaded, kicks off any initialization functions.
	*/
	$scope.init = function() {
        $scope.favoritedProperties = [];
        $scope.properties = [];
        $scope.getFavoritedProperties(function() {
            $scope.syncAllPropertiesToFavoriteContent();
        });
    };

    // Event Handler Methods ///////////////////////////////////////////////////

    // Helper Methods //////////////////////////////////////////////////////////

    $scope.getFavoritedProperties = function(callback) {
        /*$http.get('/umbraco/api/favoriteContent/getFavoritedProperties').then(functtion(response) {
            $scope.favoritedProperties = response; // an array of strings
            if (callback) {
                callback();
            }
        });*/
        // delete following mock behavior.
        $scope.favoritedProperties = ['excerpt'];
        callback();
    };

    $scope.syncAllPropertiesToFavoriteContent = function() {
        var props = contentEditingHelper.getAllProps(editorState.getCurrent());
        $scope.favoritedProperties.forEach(function(alias, index) {
            props.forEach(function(property) {
                if (property.alias === alias) {
                    if (!!$scope.properties[index]) {
                        $scope.properties[index] = property;
                    } else {
                        $scope.properties.push(property);
                    }
                }
            }.bind($scope));
        }.bind($scope));
    };


    /**
     * Syncs the current value of a favorite content property editor to its
     * actual version on the content node.
     * @param {number} index
     */
    $scope.syncFavoriteContentToProperty = function(index) {
        var alias = $scope.favoritedProperties[index];
        var clonedContent = editorState.getCurrent();
        clonedContent.properties.forEach(function(property) {
            if (property.alias === alias) {
                property.value = $scope.properties[index].value;
            }
        });
        clonedContent.tabs.forEach(function(tab) {
            tab.properties.forEach(function(property) {
                if (property.alias === alias) {
                    property.value = $scope.properties[index].value;
                }
            });
        });
        contentEditingHelper.reBindChangedProperties(editorState.getCurrent(), clonedContent);
    };

	// Call $scope.init() //////////////////////////////////////////////////////

    $scope.init();

});
