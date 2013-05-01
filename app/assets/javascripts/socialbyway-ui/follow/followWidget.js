(function($) {"use strict";
	/*jslint nomen: true*/
	/*jslint plusplus: true */
	/*global console, SBW*/
	/**
	 * @class FollowWidget
	 * @namespace FollowWidget
	 * @classdesc SocialByWay Follow Widget to get the follow count based on the service and gives interaction to follow a page/UI
	 * @property {Number} count - The aggregated follow count for all services.
	 * @property {Object} options - The options for the widget.
	 * @property {Object} serviceCount - An object containing the follow count of each service.
	 * @augments JQuery.Widget
	 * @alias FollowWidget
	 * @constructor
	 */
	$.widget("ui.FollowWidget", /** @lends FollowWidget.prototype */
	{
		count : 0,
		options : {
			userDetails : null,
			services : ['facebook', 'twitter', 'linkedin'],
			theme : 'default'
		},
		serviceCount : null,
		/**
		 * @method
		 * @private
		 * @desc Constructor for the widget.
		 */
		_create : function() {
			var self = this, serviceFollowCountContainer, theme = self.options.theme, containerDiv = $("<div />", {
				'class' : 'sbw-widget sbw-follow-widget-' + theme
			}), serviceDiv = $("<div />", {
				'class' : 'service-container'
			}), followButton = $('<span />', {
				'class' : 'follow-button'
			}), followCountContainer = $("<div />", {
				'class' : 'count-container'
			}).text('0'), minAngle = 360 / this.options.services.length;

			self.serviceCount = {};

			$.each(this.options.services, function(index, service) {
				var serviceContainer = self.createServiceElement(service, serviceDiv, (minAngle * index), self);
				serviceFollowCountContainer = $("<div />", {
					'class' : service + '-count service-count-container'
				}).text('0').appendTo(serviceContainer);

			});
			
			$(serviceDiv).append(followButton, followCountContainer);
			$(containerDiv).append(serviceDiv);
			$(self.element).append(containerDiv);
			self.hideServices();
			$(containerDiv).hover(self.showServices, self.hideServices);
		},
		/**
		 * @method
		 * @desc Function to create a service div and place it at the required position in the widget.
		 * @param {String} service The social network for which the container is being created.
		 * @param {Object} parentContainer The DOM element to which the service container must be added.
		 * @param {Number} angle The angle at which the service container has to be placed.
		 * @param {Object} context The context for the function call.
		 * @return {Object} The DOM element for the service.
		 */
		createServiceElement : function(service, parentContainer, angle, context) {
			var serviceContainer = $("<div/>", {
				'class' : service,
				'data-service' : service,
				'click' : function(event) {
					context.followForService(event, context);
				},
				'style' : '-webkit-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' + '-moz-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' + '-ms-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' + '-o-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' + 'transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg)'
			}).appendTo(parentContainer);
			return serviceContainer;
		},
		/**
		 * @method
		 * @desc Function to show services on mouse hover.
		 */
		showServices : function() {
            var servicesContainer = $("div.service-container");
            servicesContainer.find("div").show();
            servicesContainer.find("div.count-container").hide();
		},
		/**
		 * @method
		 * @desc Function to hide services when the widget loses focus.
		 */
		hideServices : function() {
            var servicesContainer = $("div.service-container");
            servicesContainer.find("div").hide();
            servicesContainer.find("div.count-container").show();
		},
		/**
		 * @method
		 * @param {String} service Name of the registered service.
		 */
		updateForService : function(service) {
			var self = this;
			SBW.api.getFollowCount(service, self.options.userDetails[service], function(response) {
				var targetContainer = $("div.service-container");
				if (response && response.count) {
					if (self.serviceCount[service]) {
						self.count -= self.serviceCount[service];
					}
					self.serviceCount[service] = response.count;
					self.count += response.count;
					targetContainer.find('div.' + service + '-count').text(response.count);
					targetContainer.find('div.count-container').text(self.count);
				}
			});
		},
		/**
		 * @method
		 * @desc Event handler that allows the user to follow the user specified in options.
		 * @param {Object} event The Event object.
		 * @param {Object} context The scope of the calling function.
		 */
		followForService : function(event, context) {
			var sourceElement = event.srcElement || event.target, service = sourceElement.dataset.service, self = this;
				SBW.api.follow(service, context.options.userDetails[service], function(response) {
                        var elem = context.element.find(".sbw-success-message");
                        if (elem.length !== 0) {
                            elem.html(elem.text().substr(0, elem.text().length - 1) + ", " + response.message+ ".");
                        } else {
                            context.element.append('<span class="sbw-success-message">'+response.message+'</span>');
                        }
						self.updateForService(service);
					},function(response) {
                    context.element.append('<span class="sbw-error-message">'+response.message+'.</span>');
                });
                context.element.find(".sbw-success-message").remove();
                context.element.find(".sbw-error-message").remove();
        },
		/**
		 * @method
		 * @desc Function to destroy the widget.
		 */
		destroy : function() {
			$.Widget.prototype.destroy.call(this, arguments);
		}
	});
})(jQuery);
